 # Install Stripe CLI
  stripe listen --forward-to
  http://localhost:3002/api/v1/stripe/webhook

  # Trigger test events
  stripe trigger checkout.session.completed
  stripe trigger invoice.payment_failed
