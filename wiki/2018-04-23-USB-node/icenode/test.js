var libftdi = require('./build/Release/icenode')

// FTDI USB identifiers
const usbVendor = 0x0403;
const usbProduct = 0x6010;
const BITMODE_MPSSE  = 0x02;
const INTERFACE_A   = 1;

const MC_READB_LOW = 0x81;   // Read Data bits LowByte
const MC_TCK_D5 = 0x8B;      // Enable /5 div, backward compat to FT2232D
const MC_SET_CLK_DIV = 0x86; // Set clock divisor


function mpsse_error(ret, msg) {
  console.log(msg);
  console.log("Error: " + libftdi.ftdi_get_error_string(ctx));
  console.log("Operation code: " + ret)
  console.log("Abort.")
  process.exit(1)
}

function mpsse_send_byte(data)
{
  let buf = new Buffer.alloc(1);
  buf[0] = data;
  var rc = libftdi.ftdi_write_data(ctx, buf, 1)
  if (rc != 1) {
    mpsse_error(rc, "Write error (single byte, rc=" + rc + "expected 1)");
  }
}

function mpsse_init(ctx) {

  libftdi.ftdi_set_interface(ctx, INTERFACE_A);

  //-- Abrir dispositivo
  ret = libftdi.ftdi_usb_open(ctx, usbVendor, usbProduct);
  if (ret) {
    mpsse_error(ret, "No encontrado dispositivo: (0x" + usbVendor.toString(16) + ', 0x' + usbProduct.toString(16) + ')' )
  }

  //-- Reset
  ret = libftdi.ftdi_usb_reset(ctx)
  if (ret) {
    mpsse_error(ret, "Failed to reset iCE FTDI USB device");
  }

  ret = libftdi.ftdi_usb_purge_buffers(ctx)
  if (ret) {
    mpsse_error(ret, "Failed to purge buffers on iCE FTDI USB device")
  }

  var buf_latency = new Buffer.alloc(1);
  ret = libftdi.ftdi_get_latency_timer(ctx, buf_latency)
  if (ret) {
    mpsse_error(ret, "Failed to get latency timer");
  }

  var latency = buf_latency[0];
  console.log("latency: "+latency)

  // 1 is the fastest polling, it means 1 kHz polling
  ret = libftdi.ftdi_set_latency_timer(ctx, 1)
  if (ret) {
    mpsse_error(ret, "Failed to set latency timer")
  }

  // Enter MPSSE (Multi-Protocol Synchronous Serial Engine) mode. Set all pins to output
  ret = libftdi.ftdi_set_bitmode(ctx, 0xFF, BITMODE_MPSSE);
  if (ret) {
    mpsse_error(ret, "Failed to set BITMODE_MPSSE on iCE FTDI USB device")
  }

	// enable clock divide by 5
	mpsse_send_byte(MC_TCK_D5);

  // set 6 MHz clock
	mpsse_send_byte(MC_SET_CLK_DIV);
	mpsse_send_byte(0x00);
	mpsse_send_byte(0x00);
}

//------------------------- MAIN -------------------------------

//-- Inicializar USB
console.log("init..")
var ctx = libftdi.create_context();
mpsse_init(ctx);

// fprintf(stderr, "cdone: %s\n", get_cdone() ? "high" : "low");

/*
static bool get_cdone(void)
{
	// ADBUS6 (GPIOL2)
	return (mpsse_readb_low() & 0x40) != 0;
}*/

/*
int mpsse_readb_low(void)
{
	uint8_t data;
	mpsse_send_byte(MC_READB_LOW);
	data = mpsse_recv_byte();
	return data;
}
*/

/*
uint8_t mpsse_recv_byte()
{
	uint8_t data;
	while (1) {
		int rc = ftdi_read_data(&mpsse_ftdic, &data, 1);
		if (rc < 0) {
			fprintf(stderr, "Read error.\n");
			mpsse_error(2);
		}
		if (rc == 1)
			break;
		usleep(100);
	}
	return data;
}*/

mpsse_send_byte(MC_READB_LOW);

var data = new Buffer.alloc(1);
var rc = libftdi.ftdi_read_data(ctx, data, 1);
console.log("Bytes Leidos: " + rc)
console.log("Data: " + data[0])



console.log("Dispositivo Abierto...")

code = libftdi.ftdi_read_chipid(ctx)
console.log("Code: " + code.toString(16))


/*
// Buffer
var buf = new Buffer.alloc(256);

// Read eeprom
var size = libftdi.ftdi_read_eeprom_getsize(ctx, buf)
console.log(libftdi.ftdi_get_error_string(ctx));
console.log('Byte count: ' + size);
console.log(buf.length)
console.log(buf.toString('hex'));
*/
