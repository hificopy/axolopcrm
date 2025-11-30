import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedSecondBrainData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');

    // Get a test user ID (assuming you have users in the system)
    const userResult = await pool.query('SELECT id FROM auth.users LIMIT 1');

    if (userResult.rows.length === 0) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    const userId = userResult.rows[0].id;
    console.log(`👤 Using user ID: ${userId}`);

    console.log('');
    console.log('📝 Creating demo nodes...');

    // Create central database nodes (orbit 0 - center, fixed position)
    const crmContactsNode = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, position_x, position_y, is_pinned)
      VALUES ($1, 'database', 'CRM Contacts', 'Central database for customer contacts', '#7b1c14', 60, 0, 400, 300, true)
      RETURNING id
    `, [userId]);

    const crmDealsNode = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, position_x, position_y, is_pinned)
      VALUES ($1, 'database', 'Deals Pipeline', 'Track all active deals and opportunities', '#7b1c14', 60, 0, 600, 300, true)
      RETURNING id
    `, [userId]);

    console.log('   ✅ Created 2 database nodes');

    // Create orbiting document nodes (orbit 1 - inner ring)
    const doc1 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Sales Strategy Q1', 'Quarterly sales strategy document', '#4C7FFF', 40, 1, 0, 180)
      RETURNING id
    `, [userId]);

    const doc2 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Product Roadmap', 'Product development roadmap', '#4C7FFF', 40, 1, 60, 180)
      RETURNING id
    `, [userId]);

    const doc3 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Team OKRs', 'Quarterly objectives and key results', '#4C7FFF', 40, 1, 120, 180)
      RETURNING id
    `, [userId]);

    console.log('   ✅ Created 3 document nodes (inner ring)');

    // Create mind map nodes (orbit 2 - middle ring)
    const map1 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'mindmap', 'Customer Journey', 'Customer lifecycle mapping', '#00D084', 45, 2, 30, 280)
      RETURNING id
    `, [userId]);

    const map2 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'mindmap', 'Product Features', 'Feature brainstorming and planning', '#00D084', 45, 2, 150, 280)
      RETURNING id
    `, [userId]);

    const map3 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'mindmap', 'Marketing Funnel', 'Marketing strategy and funnel', '#00D084', 45, 2, 270, 280)
      RETURNING id
    `, [userId]);

    console.log('   ✅ Created 3 mind map nodes (middle ring)');

    // Create additional document nodes (orbit 3 - outer ring)
    const doc4 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Meeting Notes', 'Weekly meeting notes', '#4C7FFF', 35, 3, 45, 360)
      RETURNING id
    `, [userId]);

    const doc5 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Research', 'Market research documents', '#4C7FFF', 35, 3, 135, 360)
      RETURNING id
    `, [userId]);

    const doc6 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Ideas Board', 'Innovation and idea tracking', '#4C7FFF', 35, 3, 225, 360)
      RETURNING id
    `, [userId]);

    const doc7 = await pool.query(`
      INSERT INTO second_brain_nodes (user_id, type, label, description, color, size, orbit_level, angle, radius)
      VALUES ($1, 'document', 'Templates', 'Document and email templates', '#4C7FFF', 35, 3, 315, 360)
      RETURNING id
    `, [userId]);

    console.log('   ✅ Created 4 document nodes (outer ring)');

    console.log('');
    console.log('🔗 Creating connections...');

    // Create connections between nodes
    const connections = [
      [crmContactsNode.rows[0].id, doc1.rows[0].id, 'related'],
      [crmContactsNode.rows[0].id, doc2.rows[0].id, 'related'],
      [crmDealsNode.rows[0].id, doc3.rows[0].id, 'related'],
      [crmContactsNode.rows[0].id, map1.rows[0].id, 'influences'],
      [crmDealsNode.rows[0].id, map2.rows[0].id, 'influences'],
      [crmContactsNode.rows[0].id, map3.rows[0].id, 'influences'],
      [doc1.rows[0].id, map1.rows[0].id, 'related'],
      [doc2.rows[0].id, map2.rows[0].id, 'related'],
      [map1.rows[0].id, doc4.rows[0].id, 'derived_from'],
      [crmContactsNode.rows[0].id, doc5.rows[0].id, 'related'],
    ];

    for (const [fromId, toId, type] of connections) {
      await pool.query(`
        INSERT INTO second_brain_connections (from_node_id, to_node_id, connection_type, strength)
        VALUES ($1, $2, $3, 1.0)
      `, [fromId, toId, type]);
    }

    console.log(`   ✅ Created ${connections.length} connections`);

    console.log('');
    console.log('✅ Seed data created successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - 2 Database nodes (center)');
    console.log('   - 7 Document nodes (orbiting)');
    console.log('   - 3 Mind Map nodes (orbiting)');
    console.log('   - 10 Connections');
    console.log('');
    console.log('🎨 You can now view the Logic Map in the Second Brain!');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedSecondBrainData();
