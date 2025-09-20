import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', process.env.SUPABASE_PROJECT_URL);
    console.log('Has Service Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test connection by checking if users table exists
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }
    
    console.log('✅ Supabase connection successful!');
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      data
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}