import { createClient } from '@supabase/supabase-js'
import os from 'os'

const supabaseUrl = "https://xgyovzjguphckcsalxex.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneW92empndXBoY2tjc2FseGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE5ODEsImV4cCI6MjA5MTA3Nzk4MX0.upuQwylsKIBrcK_Tf7992pXSgSshNQ3tq5JBA5wc9dw"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runAgent() {
  console.log("--- ICEBERG NODE AGENT (FINAL_TEST) ---")
  
  const payload = {
    hostname: os.hostname(),
    nombre_usuario: os.userInfo().username,
    equipo: "Computador",
    caracteristicas: `STABLE_SYNC | RAM: ${Math.round(os.totalmem() / (1024*1024*1024))}GB`,
    validado: false
  }

  console.log("Payload:", payload)

  try {
    const { data, error } = await supabase
      .from('equipos')
      .insert([payload])
      .select()

    if (error) {
      console.error("ERROR SUPABASE:", error.message)
      console.error("CODE:", error.code)
    } else {
      console.log("SUCCESS! Data inserted:", data)
    }
  } catch (err) {
    console.error("UNCAUGHT ERROR:", err)
  }
}

runAgent()
