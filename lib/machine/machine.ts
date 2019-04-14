/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {HandlerResult, NoParameters} from "@atomist/automation-client";
import {
    CommandHandlerRegistration,
    CommandListenerInvocation,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine,
} from "@atomist/sdm-core";

/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm = createSoftwareDeliveryMachine({
        name: "Empty Seed Software Delivery Machine",
        configuration,
    });

    sdm.addCommand(helloWorldCommand);
    /*
     * this is a good place to type
    sdm.
     * and see what the IDE suggests for after the dot
     */

    return sdm;
}

export async function helloWorldListener(ci: CommandListenerInvocation<NoParameters>): Promise<void> {
    return ci.addressChannels("Hello, world");
}


const helloWorldParametersDefinition = {
    name: { description: "name",
        required: true,
        pattern: /.*/, },
    location: {},
};

const helloWorldCommand: CommandHandlerRegistration<{ name: string, location: string }> = {
    name: "HelloWorld",
    description: "Responds with a friendly greeting to everyone",
    intent: "hello",
    parameters: helloWorldParametersDefinition,
    listener: async ci => {
        return ci.addressChannels(`Welcome to ${ci.parameters.location}, ${ci.parameters.name}`);
    },
};
