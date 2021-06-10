import React, {useState, Fragment} from 'react';
import {Button} from 'react-bootstrap';

import {Plugin} from '../../../../../models/api/Plugin';

import {getPlugins} from '../../../helpers/api/APIHelper';

import {Loading} from '../../general/loading/Loading';
import {Block} from '../../general/Block';
import {PluginInput} from './PluginInput';

/**
 * Component for managing plugin settings.
 */
export function PluginSettings() {
  const [creating, updateCreating] = useState(false);

  return <Loading<Plugin[]>
    loader={getPlugins}
    component={(plugins) => {
      return <Fragment>
        {plugins.map((plugin) =>
          <Block key={plugin.pluginID} transparent className="mb-3 px-2">
            <PluginInput plugin={plugin}/>
          </Block>,
        )}
        {creating ?
					<PluginInput
					  key="new-plugin"
					  newPlugin={{
					    create: (plugin) => {
					      // TODO: Show new plugin?
					      // Probably can be fixed with the new use cache stuff
					      console.log('Created a new plugin');
					      console.log(plugin);
					      updateCreating(false);
					    },
					    cancel: () => updateCreating(false),
					  }}
					/>					:
					<Button onClick={() => updateCreating(true)}>Add</Button>
        }
      </Fragment>;
    }}
  />;
}
