import { main } from './aflv';

if (require.main === module) {
  main(['cxx', ...process.argv.slice(2)]);
}
