import { main } from './aflv';

if (require.main === module) {
  main(['cc', ...process.argv.slice(2)]);
}
