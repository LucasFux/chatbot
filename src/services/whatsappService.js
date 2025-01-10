import sendToWhatsapp from '../services/httpRequest/sendToWhatsapp.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: {body}
    }
    await sendToWhatsapp(data)
  }
  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }
    sendToWhatsapp(data)
  }

  async sendInteractiveButtons(to, BodyText, buttons){

    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: BodyText },
        action: {
          buttons: buttons
        }
      }
    }
    sendToWhatsapp(data)
  }
}
export default new WhatsAppService();