import { envConfigs } from '../src/config';
import {
  environmentName,
  knownConfigurationKeys,
} from '../src/modules/config/environment';
import { isSecretConfigKey } from '../src/modules/config/service';

// Prints names and storage classes only, never current values.
for (const name of [...knownConfigurationKeys(envConfigs)].sort()) {
  console.log(
    `${name}\t${environmentName(name)}\t${isSecretConfigKey(name) || name === 'stripe_publishable_key' ? 'Secret' : 'Variable'}`
  );
}
