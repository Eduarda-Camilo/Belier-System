import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
    console.log('Criando usuário Administrador...');

    // 1. SignUp user
    const { error: authError } = await supabase.auth.signUp({
        email: 'eduarda.camilo@sc.senai.br',
        password: '12345678',
        options: {
            data: {
                full_name: 'Administrador',
                role: 'admin'
            }
        }
    });

    if (authError) {
        console.error('Erro ao assinar (pode já existir):', authError.message);
        // If it exists, let's try to update the profile directly if logging in works
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'eduarda.camilo@sc.senai.br',
            password: '12345678'
        });

        if (signInError) {
            console.error('Falha de login também:', signInError.message);
            return;
        }

        console.log('Usuário já existia, logado com sucesso. Atualizando perfil...');
        const { error: updateError } = await supabase.from('profiles').update({
            full_name: 'Administrador',
            role: 'admin'
        }).eq('id', signInData.user.id);

        if (updateError) console.error('Erro ao atualizar perfil:', updateError);
        else console.log('Perfil atualizado para Administrador com sucesso!');

    } else {
        console.log('Usuário criado na Auth. Supabase trigger deve ter criado na tabela profiles com a role Administrador.');
    }
}

setupAdmin();
