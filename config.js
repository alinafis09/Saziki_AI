import {watchFile, unwatchFile} from 'fs';
import chalk from 'chalk';
import {fileURLToPath} from 'url';
import fs from 'fs'; 
import moment from 'moment-timezone';

global.botnumber = "212624052666"
global.confirmCode = ""
global.authFile = `SazikiSession`;

// Cambiar a true si el Bot responde a sus comandos con otros comandos.
// Cambiar a false para usar el Bot desde el mismo numero del Bot.
// Error de m.isBaileys marcado como false fix temporal
global.isBaileysFail = false;
global.owner = [
  ['261125656551615', 'ALI NAFIS', true]
]
global.suittag = ['261125656551615'];
global.prems = [];

// Base Rest Api
global.BASE_API_DELIRIUS = "https://delirius-apiofc.vercel.app";
global.packname = 'Sticker';
global.author = '𝑨𝑳𝑰 𝑵𝑨𝑭𝑰𝑺';
global.wm = '𝐒𝐀𝐙𝐈𝐊𝐈--𝐁𝐎𝐓';
global.titulowm = '𝐒𝐀𝐙𝐈𝐊𝐈--𝐁𝐎𝐓';
global.titulowm2 = `𝐒𝐀𝐙𝐈𝐊𝐈--𝐁𝐎𝐓`
global.igfg = '𝐒𝐀𝐙𝐈𝐊𝐈--𝐁𝐎𝐓';
global.wait = '*_[ ⏳ ] 𝐂𝐡𝐚𝐫𝐠𝐢𝐧𝐠..._*';

global.imagen1 = fs.readFileSync('./media/images/Menu.png');
global.imagen2 = fs.readFileSync('./media/images/Menu.png');
global.imagen3 = fs.readFileSync('./media/images/Menu.png')
global.imagen4 = fs.readFileSync('./media/images/Menu.png')
global.imagen5 = fs.readFileSync('./media/images/Menu.png')

global.mods = [
    '212719558797'
];
global.GEMINI_KEY = "AIzaSyAsuSFvH70JhB1IiQU4pc3Wdl9JutkK_4A";

//* *******Tiempo***************
global.d = new Date(new Date + 3600000);
global.locale = 'es';
global.dia = d.toLocaleDateString(locale, {weekday: 'long'});
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'});
global.mes = d.toLocaleDateString('es', {month: 'long'});
global.año = d.toLocaleDateString('es', {year: 'numeric'});
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true});
//* ****************************
global.wm2 = `${dia} ${fecha}\nSaziki - Bot`;
global.gt = 'Saziki - Bot';
global.mysticbot = 'Saziki - Bot';
global.channel = '';
global.md = '';
global.mysticbot = '';
global.waitt = '*_[ ⏳ ] 𝐂𝐡𝐚𝐫𝐠𝐢𝐧𝐠..._*';
global.waittt = '*_[ ⏳ ] 𝐂𝐡𝐚𝐫𝐠𝐢𝐧𝐠..._*';
global.waitttt = '*_[ ⏳ ] 𝐂𝐡𝐚𝐫𝐠𝐢𝐧𝐠..._*';
global.nomorown = '261125656551615';
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf'];
global.cmenut = '❖––––––『';
global.cmenub = '┊✦ ';
global.cmenuf = '╰━═┅═━––––––๑\n';
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     ';
global.dmenut = '*❖─┅──┅〈*';
global.dmenub = '*┊»*';
global.dmenub2 = '*┊*';
global.dmenuf = '*╰┅────────┅✦*';
global.htjava = '⫹⫺';
global.htki = '*⭑•̩̩͙⊱•••• ☪*';
global.htka = '*☪ ••••̩̩͙⊰•⭑*';
global.comienzo = '• • ◕◕════';
global.fin = '════◕◕ • •';
global.botdate = `*[ 📅 ] Fecha:*  ${moment.tz('America/Mexico_City').format('DD/MM/YY')}`;
global.bottime = `*[ ⏳ ] Hora:* ${moment.tz('America/Mexico_City').format('HH:mm:ss')}`;
global.fgif = { key: { participant: '0@s.whatsapp.net' }, message: { 'videoMessage': { 'title': wm, 'h': `Hmm`, 'seconds': '999999999', 'gifPlayback': 'true', 'caption': bottime, 'jpegThumbnail': fs.readFileSync('./media/images/Menu.png')}}};
global.multiplier = 99;
global.flaaa = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=',
];
//* ************************

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'config.js\''));
  import(`${file}?update=${Date.now()}`);
});
