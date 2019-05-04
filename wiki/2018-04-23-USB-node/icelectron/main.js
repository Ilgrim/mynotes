const electron = require('electron')

console.log("Arrancando electron...")

//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', ()=>{
  console.log("Evento Ready!")

  // Crear la ventana principal de nuestra Interfaz Gráfica
  let win = new electron.BrowserWindow({
    minWidth: 300,
    minHeight: 200,
    width:600,
    height:650,
    //resizable: false,
    icon: './app/icelectron-icon.png',
    webPreferences: {
      nodeIntegration: true,
    }
  })

  //win.setMenuBarVisibility(false)
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
  win.loadURL(`file://${__dirname}/app/index.html`)
})