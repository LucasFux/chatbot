import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';


// clean the phone number:
const cleanPhoneNumber = (number) => {
  return number.startsWith('549') ? number.replace("549", "54") : number;
};

let senderName = "Nombre del sender";

class MessageHandler {


  constructor(){
    this.addExpenseState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();
    
  
      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(cleanPhoneNumber(message.from), message.id, senderInfo)
        await this.sendOptionsMenu(cleanPhoneNumber(message.from))
      } else if(this.addExpenseState[cleanPhoneNumber(message.from)]){
        await this.addNewExpense(cleanPhoneNumber(message.from), incomingMessage)

      } else {
        const name =  this.getSenderName(senderInfo)
        const response = `Hola, ${name}! Este bot es para cargar un nuevo gasto.
        
        Envía "hi" o "cash" para seguir.`;
        await whatsappService.sendMessage(cleanPhoneNumber(message.from), response, message.id);

      }


      await whatsappService.markAsRead(message.id);
    } else if (message?.type === 'interactive'){
      const option = message?.interactive?.button_reply?.title.toLowerCase().trim();
      await this.handleOptionsMenu(cleanPhoneNumber(message.from), option);
      await whatsappService.markAsRead(message.id);

    }
  }

  isGreeting(message){
    const greetings = ["hi", "cash"];
    return greetings.includes(message);
  }

  getSenderName(senderInfo){
    return senderInfo.profile?.name || "NADA"
  }

async sendWelcomeMessage(to, messageId, senderInfo){
  const name = this.getSenderName(senderInfo)
  const welcomeMessage = `Hola, ${name.split(' ')[0]}! vas a cargar un nuevo flujo de dinero.`
  senderName = this.getSenderName(senderInfo).split(' ')[0];
  console.log("NOMBRE DEL ENVIO: " + senderName)

  await whatsappService.sendMessage(to, welcomeMessage, messageId);
}

// send the categories of differents expenses
async sendOptionsMenu(to){
  const menuMessage = "Que queres cargar? "
  const buttons = [
    {type: 'reply', reply: {id: 'option_1', title:'Ingreso'}},
    {type: 'reply', reply: {id: 'option_2', title:'Egreso'}},
    {type: 'reply', reply: {id: 'option_3', title:'cancelar'}}
  ];

  await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);

}

async handleOptionsMenu(to, option){
  let response;
  switch(option) {
    case 'ingreso':
      response = 'Todavía no esta funcionando esta opción. Volvé a envíar "hi" para cargar un egreso';
      break;
    case 'egreso':
      this.addExpenseState[to]={step: 'concept'}
      response = 'Concepto del gasto?';
      break;
    case 'cancelar':
      response = 'Cancelado, nos vemos.';
      break;
    default:
      response = 'Tenes que elegir una de las categorias del menu.'
  }

  await whatsappService.sendMessage(to, response);

}

completeNewExpense(to){
  const expense = this.addExpenseState[to];
  delete this.addExpenseState[to];

  const expenseData = [
    senderName,
    expense.concept,
    expense.amount,
    expense.category,
    new Date().toISOString()
  ]

  appendToSheet(expenseData);
  return `*Gasto cargado*

  Concepto: ${expense.concept}
  Monto: $ ${expense.amount}
  Categoria: ${expense.category}
  `
}

isCategoriesOptions(message){
  const categoriesOptions = ["1", "2","3","4"];
  return categoriesOptions.includes(message);
}

async addNewExpense(to, message){
  const state = this.addExpenseState[to];
  let response = "";

  switch(state.step){
    case 'concept':
      state.concept = message;
      state.step = 'amount';
      response = "Cual es el monto?";
      break;
      case 'amount':
        // Validar que el monto sea un número positivo
        if (!/^\d+(\.\d{1,2})?$/.test(message)) { // Permite decimales opcionales
            response = "Monto inválido. Por favor, ingresa un número válido (Ejemplo: 150 o 150.50).";
        } else {
            state.amount = parseFloat(message); // Guarda el monto como número
            state.step = 'category';
            response = `Y la categoría? Opciones:
            1- Departamento
            2- Salud
            3- Estudio
            4- Ocio
            5- Taxi/Uber
            6- Cole Urbano
            7- Colectivo
            `;
        }
        break;
    case 'category':
      if (this.isCategoriesOptions(message)){
        state.category = message;
        response = this.completeNewExpense(to);
      } else {
        response = "Valor invalido, elegí una de las opciones."
      }
      break;
  }
  await whatsappService.sendMessage(to, response)

}

}

export default new MessageHandler();