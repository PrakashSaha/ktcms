import dns from 'dns';

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export default {
  register() {},
  async bootstrap({ strapi }) {
    strapi.log.info('--- Production Bootstrapping Starting ---');
    strapi.log.info('✅ Strapi is clean and ready!');
  },
};
