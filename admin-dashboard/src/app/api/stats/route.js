import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // We will query some basic stats to display
    // 1. Total Accounts
    const [accounts] = await pool.query('SELECT COUNT(*) as count FROM account');
    
    // 2. Attribute Server (Buffs)
    const [buffs] = await pool.query(`
      SELECT s.id, t.name, s.value 
      FROM attribute_server s
      JOIN attribute_template t ON s.attribute_template_id = t.id
    `);

    // 3. Admin Panel Config
    const [adminPanel] = await pool.query('SELECT title, domain, trangthai FROM adminpanel LIMIT 1');

    return NextResponse.json({
      success: true,
      stats: {
        totalAccounts: accounts[0].count,
        buffs: buffs,
        config: adminPanel[0] || {}
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data. Is MySQL running?' }, { status: 500 });
  }
}
