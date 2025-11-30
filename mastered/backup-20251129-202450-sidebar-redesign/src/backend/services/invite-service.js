import crypto from "crypto";
import { supabaseServer } from "../config/supabase-auth.js";
import EmailService from "./email-service.js";

class InviteService {
  /**
   * Generate a secure invite token
   */
  generateInviteToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Create an invite and send email
   */
  async createInvite({
    agencyId,
    invitedByUserId,
    recipientEmail,
    recipientName,
    role = "member",
  }) {
    try {
      // 1. Check if user already exists
      const { data: authUser, error: userError } =
        await supabaseServer.auth.admin.getUserByEmail(recipientEmail);

      if (userError || !authUser?.user) {
        throw new Error("User not found with this email address");
      }

      const invitedUserId = authUser.user.id;

      // 2. Check if user is already a member
      const { data: existingMember } = await supabaseServer
        .from("agency_members")
        .select("id")
        .eq("agency_id", agencyId)
        .eq("user_id", invitedUserId)
        .single();

      if (existingMember) {
        throw new Error("This user is already a member of this agency");
      }

      // 3. Get agency info
      const { data: agency, error: agencyError } = await supabaseServer
        .from("agencies")
        .select("name, max_users, current_users_count")
        .eq("id", agencyId)
        .single();

      if (agencyError || !agency) {
        throw new Error("Agency not found");
      }

      // 4. Check seat availability
      if (agency.current_users_count >= agency.max_users) {
        throw new Error(
          `Agency has reached maximum capacity (${agency.max_users} seats). Please upgrade to add more members.`,
        );
      }

      // 5. Generate invite token
      const inviteToken = this.generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      // 6. Create invite record
      const { data: invite, error: inviteError } = await supabaseServer
        .from("agency_invites")
        .insert({
          agency_id: agencyId,
          invited_by: invitedByUserId,
          email: recipientEmail,
          name: recipientName,
          role: role,
          token: inviteToken,
          status: "pending",
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (inviteError) {
        throw new Error(`Failed to create invite: ${inviteError.message}`);
      }

      // 7. Send invitation email
      try {
        const emailService = new EmailService();
        await emailService.sendEmail({
          to: recipientEmail,
          subject: `You've been invited to join ${agency.name} on Axolop CRM`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  background-color: #f4f4f4; 
                  margin: 0; 
                  padding: 0; 
                  color: #333; 
                }
                .container { 
                  max-width: 600px; 
                  margin: 40px auto; 
                  padding: 20px; 
                  background-color: white; 
                  border-radius: 12px; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                }
                .header { 
                  background: linear-gradient(135deg, #3F0D28 0%, #8B1538 100%); 
                  padding: 30px; 
                  text-align: center; 
                  border-radius: 12px 12px 0 0; 
                }
                .header h1 { 
                  color: white; 
                  margin: 0; 
                  font-size: 28px; 
                  font-weight: 700; 
                }
                .invite-box { 
                  background: #f9f9f9; 
                  border-left: 4px solid #3F0D28; 
                  padding: 20px; 
                  margin: 24px 0; 
                  border-radius: 4px; 
                }
                .invite-box strong { 
                  color: #3F0D28; 
                }
                .cta-button { 
                  display: inline-block; 
                  background: linear-gradient(135deg, #3F0D28 0%, #8B1538 100%); 
                  color: white; 
                  padding: 14px 32px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  font-weight: 600; 
                  margin: 20px 0; 
                }
                .footer { 
                  text-align: center; 
                  margin-top: 30px; 
                  padding: 20px; 
                  background-color: #f9f9f9; 
                  border-radius: 12px; 
                }
                .footer p { 
                  color: #666; 
                  font-size: 12px; 
                  margin: 0; 
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 You're Invited!</h1>
                </div>
                
                <div class="invite-box">
                  <p>Hi ${recipientName || "there"},</p>
                  <p><strong>${invitedByUserId}</strong> has invited you to join their team on <strong>Axolop CRM</strong>.</p>
                  
                  <p><strong>Agency:</strong> ${agency.name}</p>
                  <p><strong>Invited by:</strong> Agency Admin</p>
                </div>

                <p>You've been invited to collaborate with your team on Axolop CRM - all-in-one platform that replaces 10+ tools for agency owners.</p>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/signin" class="cta-button">
                    Accept Invitation & Sign In
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>Sent from <strong>Axolop CRM</strong></p>
              </div>
            </div>
          </body>
            </html>
          `,
        });

        console.log("Invitation email sent to:", recipientEmail);
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // Don't fail the whole operation if email fails
      }

      // 8. Return success result
      return {
        success: true,
        invite: {
          id: invite.id,
          token: inviteToken,
          agencyId: agencyId,
          email: recipientEmail,
          name: recipientName,
          role: role,
          expiresAt: expiresAt.toISOString(),
        },
      };
    } catch (error) {
      console.error("Error creating invite:", error);
      throw error;
    }
  }

  /**
   * Accept an invitation
   */
  async acceptInvite({ token, userId }) {
    try {
      // 1. Find and validate invite
      const { data: invite, error: inviteError } = await supabaseServer
        .from("agency_invites")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (inviteError || !invite) {
        throw new Error("Invalid or expired invitation");
      }

      // Check expiration
      if (new Date(invite.expires_at) < new Date()) {
        throw new Error("This invitation has expired");
      }

      // 2. Get agency info
      const { data: agency, error: agencyError } = await supabaseServer
        .from("agencies")
        .select("id, name")
        .eq("id", invite.agency_id)
        .single();

      if (agencyError || !agency) {
        throw new Error("Agency not found");
      }

      // 3. Create agency membership
      const { data: membership, error: membershipError } = await supabaseServer
        .from("agency_members")
        .insert({
          agency_id: invite.agency_id,
          user_id: userId,
          role: invite.role,
          invitation_status: "active",
          invited_by: invite.invited_by,
          invited_at: new Date().toISOString(),
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (membershipError) {
        throw new Error(
          `Failed to create membership: ${membershipError.message}`,
        );
      }

      // 4. Update invite status
      await supabaseServer
        .from("agency_invites")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invite.id);

      // 5. Update agency user count
      await supabaseServer.rpc("increment_column", {
        table_name: "agencies",
        column_name: "current_users_count",
        row_id: invite.agency_id,
      });

      // 6. Send welcome email
      try {
        const { data: user } =
          await supabaseServer.auth.admin.getUserById(userId);

        if (user?.user) {
          const emailService = new EmailService();
          await emailService.sendEmail({
            to: user.user.email,
            subject: `Welcome to ${agency.name}! 🎉`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    background-color: #f4f4f4; 
                    margin: 0; 
                    padding: 0; 
                    color: #333; 
                  }
                  .container { 
                    max-width: 600px; 
                    margin: 40px auto; 
                    padding: 20px; 
                    background-color: white; 
                    border-radius: 12px; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                  }
                  .header { 
                    background: linear-gradient(135deg, #3F0D28 0%, #8B1538 100%); 
                    padding: 30px; 
                    text-align: center; 
                    border-radius: 12px 12px 0 0; 
                  }
                  .header h1 { 
                    color: white; 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: 700; 
                  }
                  .welcome-box { 
                    background: linear-gradient(135deg, #3F0D28 0%, #8B1538 100%); 
                    color: white; 
                    padding: 30px; 
                    margin: 24px 0; 
                    border-radius: 8px; 
                    text-align: center; 
                  }
                  .welcome-box h2 { 
                    margin: 0 0 10px 0; 
                  }
                  .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    padding: 20px; 
                    background-color: #f9f9f9; 
                    border-radius: 12px; 
                  }
                  .footer p { 
                    color: #666; 
                    font-size: 12px; 
                    margin: 0; 
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Welcome to Axolop CRM! 🎉</h1>
                  </div>
                  
                  <div class="welcome-box">
                    <h2>Welcome to ${agency.name}, ${user.user.user_metadata?.full_name || user.user.user_metadata?.name || "there"}!</h2>
                    <p>You're now part of the team</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" class="cta-button">
                      Go to Dashboard
                    </a>
                  </div>
                </div>

                <div class="footer">
                  <p>Need help? Check out our <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/help">documentation</a> or contact <a href="mailto:support@axolopcrm.com">support</a></p>
                </div>
              </div>
            </body>
            </html>
            `,
          });
        }
      } catch (welcomeEmailError) {
        console.error("Failed to send welcome email:", welcomeEmailError);
        // Don't fail the whole operation if welcome email fails
      }

      return {
        success: true,
        membership: {
          id: membership.id,
          agencyId: agency.id,
          agencyName: agency.name,
          role: invite.role,
        },
      };
    } catch (error) {
      console.error("Error accepting invite:", error);
      throw error;
    }
  }

  /**
   * Resend an invitation email
   */
  async resendInvite({ inviteId, userId }) {
    try {
      // 1. Get invite details
      const { data: invite, error } = await supabaseServer
        .from("agency_invites")
        .select("*")
        .eq("id", inviteId)
        .eq("invited_by", userId)
        .single();

      if (error || !invite) {
        throw new Error("Invite not found or you do not have permission");
      }

      // 2. Resend email using same logic as create
      const result = await this.createInvite({
        agencyId: invite.agency_id,
        invitedByUserId: invite.invited_by,
        recipientEmail: invite.email,
        recipientName: invite.name,
        role: invite.role,
      });

      return {
        success: true,
        message: "Invitation resent successfully",
      };
    } catch (error) {
      console.error("Error resending invite:", error);
      throw error;
    }
  }

  /**
   * Cancel an invitation
   */
  async cancelInvite({ inviteId, userId }) {
    try {
      // 1. Get invite and verify ownership
      const { data: invite, error } = await supabaseServer
        .from("agency_invites")
        .select("*")
        .eq("id", inviteId)
        .eq("invited_by", userId)
        .single();

      if (error || !invite) {
        throw new Error("Invite not found or you do not have permission");
      }

      // 2. Update invite status
      await supabaseServer
        .from("agency_invites")
        .update({
          status: "cancelled",
        })
        .eq("id", inviteId);

      return {
        success: true,
        message: "Invitation cancelled successfully",
      };
    } catch (error) {
      console.error("Error cancelling invite:", error);
      throw error;
    }
  }
}

export default new InviteService();
