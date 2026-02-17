# METODO DE PAGAMENTO FIXO

## DESCRIÇÃO
Usar o métido de pix fixo da Infinite Pay para pagamentos. Com QR Code Fixo e Chave Fixa.

1. QR Code Fixo: Localizado em: lib/Assets/pay/infinite-pix.md.
2. Chave Fixa: df129ca4-919d-497a-b79e-179162f97e20.


## Analise

 Seria mais fácil usar o pix fixo onde é exibido no app o qrcode e pix fixo. 
 Porém precisamos amarrar o pagamento de forma que eu consiga saber qual usuário do sistema pagou o pix e para qual entregador esse pagamento deve ser enviado.
 
1. Ordene para mim, exiba o fluxo de pagamento atual em detalhes como ele ocorre e o comportamento das telas o que abre o que não abre, redirecionamento.

2. Depois vamos refatorar o codigo para quando o comerciante pagar o pix, usando qrcode fixo e chave pix fixa, o sistema consiga identificar qual usuário fez o pagamento e para qual entregador esse pagamento deve ser enviado.