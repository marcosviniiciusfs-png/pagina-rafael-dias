# Pendências para publicação

Este arquivo separa o que já funciona tecnicamente do que ainda depende de confirmação do Dr. Rafael, da equipe e dos responsáveis jurídico/privacidade.

## 1. Identidade e dados profissionais — bloqueante

- Confirmar por certidão o registro exibido: `CRBM-5217/PA` (informado pelo Dr. Rafael Dias; exibido no rodapé do site).
- Confirmar a forma aprovada de apresentação da profissão e da especialidade do Dr. Rafael Dias (biomedicina estética / harmonização facial), conforme as normas do CRBM.
- Confirmar que o WhatsApp configurado em `config.js` é o número oficial do Instituto Rafael Dias.
- A logo oficial em PNG foi fornecida e aplicada. Solicitar também o arquivo vetorial original para futuras ampliações e fornecer um retrato aprovado do profissional; enquanto não houver retrato, o bloco “Sobre” exibe a marca oficial.

Confirmar o registro exibido (`CRBM-5217/PA`) na consulta pública do conselho profissional.

## 2. Casos, depoimentos e autorização de imagem — bloqueante

- Solicitar os seis comparativos originais, sem captura de tela, textos da interface ou compressão do Instagram.
- Confirmar que cada paciente assinou autorização/TCLE específico para publicação e que cada caso foi realizado pelo profissional identificado.
- Validar a exibição de nome e número de inscrição junto a todas as peças clínicas.
- Revisar se os vídeos mostram etapas de procedimento e se estão de acordo com as normas de publicidade do conselho profissional (CRBM/CFBM).
- Manter linguagem sem promessa ou garantia de resultado; cada caso é individual.


## 3. Mapa das mídias usadas no protótipo

| Bloco | Arquivo atual | Situação antes de publicar |
|---|---|---|
| Hero | `assets/media/hero.mp4` — reel `DZxsygcJ2vw` | Conteúdo do perfil oficial; solicitar original, editar para 8–12 s e remover música/textos. O poster atual foi extraído do arquivo comprimido e deve ser substituído junto com o vídeo. Revisar cenas de procedimento conforme CFO. |
| Resultados | `case-01.jpg` a `case-06.jpg` | Conteúdos do perfil oficial; trocar pelos arquivos originais e conferir TCLE de todos os pacientes. |
| Depoimento | `testimonial-alt.mp4` — reel `DIes9UYzdmt` | Alternativa oficial usada porque o link principal do blueprint (`DKkqlLqJqKZ`) pertence a outro profissional e a outro procedimento. Solicitar original e autorização. |
| Experiência | `case-video-alt.mp4` — reel `DYnUXw-JxbD` | Alternativa oficial usada porque `DbolLh6JUIj` não pôde ser validado. Solicitar original e revisar conteúdo clínico. |
| Retrato | Logo oficial como solução temporária | O link `DbrNFcgAOsF` não pertence ao perfil oficial informado. Fornecer fotografia original aprovada. |
| Tecnologia | Reuso de `hero.mp4` | O reel `DWZDOWjjVLV` não ficou disponível para validação. Fornecer o vídeo original específico de tecnologia. |


## 4. Conversão e integrações — bloqueante para operação completa

- O lead já é salvo no Cloudflare D1 antes da abertura do WhatsApp. Definir se também deve ser sincronizado com CRM, webhook ou outra ferramenta de atendimento.
- Se houver integração, documentar endpoint, autenticação, tratamento de falhas, retenção e responsáveis.
- Confirmar mensagem inicial, horário de atendimento e SLA da equipe.
- Configurar um único container GTM em `config.js`; o valor está vazio por segurança.
- O Pixel da Meta `2258593511572731` está configurado com consentimento prévio. Configurar GA4, Google Ads ou TikTok somente com IDs próprios e usando a mesma regra de consentimento para tecnologias não essenciais.
- Preservar a regra de não enviar dados pessoais ao `dataLayer`.

## 5. Privacidade e publicação técnica — bloqueante

- Revisar juridicamente `privacidade.html` e preencher nome/razão social do controlador, CNPJ/CPF quando cabível, endereço, canal do titular e encarregado.
- Definir base legal, prazo de retenção, operadores e procedimento de atendimento aos direitos do titular.
- Validar juridicamente o texto e o comportamento do aviso de consentimento já implementado antes do início das campanhas.
- Substituir fontes do Google por arquivos locais se a política de privacidade adotada assim exigir.
- Definir domínio final e então adicionar `canonical`, `og:url`, `og:image`, sitemap, robots e imagens sociais.
- Substituir os posters derivados dos arquivos comprimidos, otimizar os originais e validar desempenho no ambiente de hospedagem.
- Fazer revisão final de conteúdo, CRBM, acessibilidade e dispositivos reais antes de remover o caráter de protótipo.
