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

import {DefaultHttpClientFactory, GitHubRepoRef, HttpMethod, MappedParameter, MappedParameters, Parameters} from "@atomist/automation-client";
import {defaultConfiguration, getUserConfig} from "@atomist/automation-client/lib/configuration";
import {AutoMergeMethod, AutoMergeMode, BranchCommit} from "@atomist/automation-client/lib/operations/edit/editModes";
import {
    CodeTransform,
    CommandHandlerRegistration,
    GeneratorRegistration,
    goalContributors,
    goals,
    HasTravisFile,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    whenPushSatisfies,
} from "@atomist/sdm";
import {createSoftwareDeliveryMachine} from "@atomist/sdm-core";
import {Build} from "@atomist/sdm-pack-build";
import {
    ReplaceReadmeTitle,
    SetAtomistTeamInApplicationYml,
    SpringProjectCreationParameterDefinitions,
    SpringProjectCreationParameters,
    TransformSeedToCustomProject,
} from "@atomist/sdm-pack-spring";
import {AddRepositorySlug, addTravisCodeTransformation, AddTravisFile} from "./addTravisCodeTransformation";
import {reportValuesCommand} from "./reportValuesCommand";

/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm = createSoftwareDeliveryMachine({
        name: "My Little Software Delivery Machine",
        configuration,
    });

    sdm.addCommand(helloWorldCommand);
    sdm.addCommand(reportValuesCommand);
    sdm.addGeneratorCommand(springSeedProjectGeneratorCommand);

    const build = new Build().with({
        externalTool: "travis",
    });

    // const autofixGoal = new Autofix();
    // const pushReactionGoal = new PushImpact();
    // const artifactGoal = new Artifact();
    // const codeInspectionGoal = new AutoCodeInspection();
    // const BuildGoals = goals("build").and(autofixGoal).and(codeInspectionGoal)
    //     .plan(build);

    const BuildGoals = goals("build").plan(build);

    sdm.addGoalContributions(goalContributors(
        whenPushSatisfies(HasTravisFile).setGoals(BuildGoals),
    ));

    sdm.addCodeTransformCommand( addTravisCodeTransformation)

    // sdm.addExtensionPacks(
    //     springSupport({
    //         review: {
    //             springStyle: true,
    //             cloudNative: true,
    //         },
    //         autofix: {
    //             springStyle: true,
    //         },
    //         inspectGoal: codeInspectionGoal,
    //         autofixGoal,
    //         reviewListeners:  isInLocalMode() ? [] : [
    //             singleIssuePerCategoryManaging("sdm-pack-spring")],
    //     }),
    // );
    return sdm;
}

const springSeedProjectGeneratorCommand: GeneratorRegistration<SpringProjectCreationParameters>  = {
    name: "create-spring",
    intent: "create spring",
    description: "Create a new Java Spring Boot REST service",
    parameters: SpringProjectCreationParameterDefinitions,
    startingPoint: new GitHubRepoRef("atomist-seeds", "spring-rest-seed"),
    transform: [
        ReplaceReadmeTitle,
        SetAtomistTeamInApplicationYml,
        TransformSeedToCustomProject,
    ],
};

const helloWorldParametersDefinition = {
    name: { description: "name",
        required: true,
        pattern: /.*/ },
    location: {},
};

const helloWorldCommand: CommandHandlerRegistration<{ name: string, location: string }> = {
    name: "HelloWorld",
    description: "Responds with a friendly greeting to everyone",
    intent: "hello",
    parameters: helloWorldParametersDefinition,
    listener: async ci => {
        return ci.addressChannels(`Welcome to ${ci.parameters.location}, ${ci.parameters.name} `);
    },
};
