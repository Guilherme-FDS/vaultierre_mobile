# Minha adega — regra de negócio

Versão digital do cartão de degustação que vai na caixa. Cada edição recebida vira uma entrada na adega,
com a ficha de cada rótulo (origem, teor, aroma, sabor, harmonização, história) e a nota do cliente.

## Regra da surpresa (definida em 25/11/2026)
- A ficha e os rótulos da edição **só aparecem depois que o cliente toca em "Já recebi minha caixa"**.
- Antes disso a edição aparece **trancada**: foto/silhueta da caixa, "Sua caixa está a caminho", sem nomes de
  rótulos, sem fotos das garrafas e sem ficha. Nada no app (notificação, Início, Adega) revela o conteúdo antes.
- Ao confirmar: animação de "abrir a caixa", libera as fichas e pede a nota de cada rótulo (opcional).
- A confirmação vale por assinante e por edição (Reserva libera os 2 rótulos juntos).
- Edições antigas confirmadas ficam liberadas para sempre; o cliente pode rever e mudar a nota.

## O que o backend precisa (ainda não existe)
1. **Edição do mês** (admin): mês/ano, nome da edição, rótulos com ficha completa e foto, plano (Essencial = 1, Reserva = 2).
2. **Envio por assinante**: qual edição cada assinatura recebeu (gerado a cada cobrança aprovada) + status
   `a_caminho` → `recebida` (o "Já recebi" do cliente; opcional: o admin também pode marcar).
3. **Avaliação**: nota (1–5) e comentário por cliente e rótulo — alimenta o perfil de paladar e evita repetir rótulo.
4. API: a ficha só é devolvida para envios `recebida` (a regra vale no servidor, não só na tela).
