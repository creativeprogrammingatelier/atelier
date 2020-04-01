import * as React from "react";
import {Loading} from "../../general/loading/Loading";
import {getPlugins} from "../../../../helpers/APIHelper";
import {Plugin} from "../../../../../models/api/Plugin";
import {useState, Fragment} from "react";
import {Block} from "../../general/Block";
import {Button} from "react-bootstrap";
import {PluginInput} from "./PluginInput";

export function PluginSettings() {
	const [creating, updateCreating] = useState(false);

	return (
		<Loading<Plugin[]>
			loader={getPlugins}
			component={plugins => {
				return <Fragment>
					{plugins.map(plugin =>
						<Block transparent className="mb-3 px-2">
							<PluginInput plugin={plugin}/>
						</Block>
					)}
					{creating ?
						<PluginInput newPlugin={{
							create: plugin => {
								// TODO: Show new plugin?
								console.log("Created a new plugin");
								console.log(plugin);
								updateCreating(false);
							},
							cancel: () => updateCreating(false)
						}}/>
						:
						<Button onClick={() => updateCreating(true)}>Add</Button>
					}
				</Fragment>
			}}
		/>
	);
}