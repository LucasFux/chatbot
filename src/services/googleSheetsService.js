import path from 'path';
import { google } from 'googleapis';
import config from '../config/env.js';

const sheets = google.sheets('v4');

async function addRowToSheet(auth,spreadsheetId,values) {
    const request = {
        spreadsheetId,
        range: 'egresos',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,

    }
    try {

        const response = (await sheets.spreadsheets.values.append(request).data);
        return response;

    } catch (error){
        console.error(error)
    }
}


const appendToSheet = async (data) => {

    try {
        const auth = new google.auth.GoogleAuth({
            credentials:{
                "type": config.CREDENTIALS_TYPE,
                "project_id": config.CREDENTIALS_PROJECT_ID,
                "private_key_id": config.CREDENTIALS_PRIVATE_KEY_ID,
                "private_key": config.CREDENTIALS_PRIVATE_KEY.replace(/\\n/g, '\n'),
                "client_email": config.CREDENTIALS_CLIENT_EMAIL,
                "client_id": config.CREDENTIALS_CLIENT_ID,
                "auth_uri": config.CREDENTIALS_AUTH_URI,
                "token_uri": config.CREDENTIALS_TOKEN_URI,
                "auth_provider_x509_cert_url": config.CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL,
                "client_x509_cert_url": config.CREDENTIALS_CLIENT_X509_CERT_URL,
                "universe_domain": config.CREDENTIALS_UNIVERSE_DOMAIN
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        })
        const authClient = await auth.getClient();
        const spreadsheetId = '1mkHG69WVXSAjhT9YbPc9PV5eQXO-pysWBp7MF7QfbCw'

        await addRowToSheet(authClient, spreadsheetId, data);
        return 'Datos correctamente agregados'

    } catch (error) {
        console.error(error)
        
    }

}

export default appendToSheet;