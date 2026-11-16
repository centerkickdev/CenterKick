export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns');
    // Avoid IPv6 resolution timeout stalls (ConnectTimeoutError / UND_ERR_CONNECT_TIMEOUT)
    // on environments where IPv6 route hangs or drops packets
    dns.setDefaultResultOrder('ipv4first');
  }
}
