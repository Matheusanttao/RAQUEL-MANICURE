# 🗄️ Configuração do Banco de Dados - Supabase

## 📋 Passo a Passo Completo

### 1. 🚀 Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub, Google, etc.)
4. Crie um novo projeto:
   - Nome: `raquel-pinheiro-site`
   - Senha do banco: (escolha uma senha forte)
   - Região: escolha a mais próxima do Brasil

### 2. 🔧 Configurar o Projeto

1. **Copie as credenciais:**
   - Vá em "Settings" > "API"
   - Copie a "Project URL" e "anon public" key

2. **Atualize o arquivo `src/supabase.js`:**
   ```javascript
   const supabaseUrl = 'SUA_URL_AQUI'
   const supabaseKey = 'SUA_CHAVE_AQUI'
   ```

### 3. 🗃️ Criar as Tabelas

1. No Supabase, vá em "SQL Editor"
2. Cole o código do arquivo `database-setup.sql`
3. Clique em "Run" para executar

### 4. 🔐 Configurar Segurança

1. Vá em "Authentication" > "Settings"
2. Desabilite "Enable email confirmations" (para simplificar)
3. Configure as políticas de segurança conforme o SQL

### 5. ✅ Testar a Integração

1. Execute o projeto: `npm start`
2. Faça login como admin
3. Configure alguns horários
4. Teste um agendamento
5. Verifique se os dados aparecem no Supabase

## 🎯 Vantagens do Supabase

- ✅ **Gratuito** até 500MB de dados
- ✅ **Interface web** para gerenciar dados
- ✅ **Tempo real** - dados sincronizados automaticamente
- ✅ **Backup automático**
- ✅ **Segurança** - dados criptografados
- ✅ **Escalável** - cresce com seu negócio

## 🔄 Backup e Restauração

### Backup Manual:
1. No Supabase: "Database" > "Backups"
2. Clique em "Create backup"

### Restaurar:
1. "Database" > "Backups"
2. Selecione o backup desejado
3. Clique em "Restore"

## 📊 Monitoramento

- **Dashboard**: Veja estatísticas em tempo real
- **Logs**: Acompanhe todas as operações
- **Performance**: Monitore velocidade das consultas

## 🚨 Troubleshooting

### Erro de Conexão:
- Verifique se as credenciais estão corretas
- Confirme se o projeto está ativo

### Erro de Permissão:
- Verifique as políticas RLS
- Confirme se as tabelas foram criadas

### Dados não aparecem:
- Verifique o console do navegador
- Confirme se as funções estão sendo chamadas

## 💡 Dicas Importantes

1. **Sempre faça backup** antes de mudanças importantes
2. **Teste em ambiente de desenvolvimento** primeiro
3. **Monitore o uso** para não exceder limites gratuitos
4. **Configure notificações** para alertas importantes

## 🆘 Suporte

- **Documentação**: https://supabase.com/docs
- **Comunidade**: https://github.com/supabase/supabase/discussions
- **Status**: https://status.supabase.com

