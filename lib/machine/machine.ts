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

import {GitHubRepoRef} from "@atomist/automation-client";
import {
    CommandHandlerRegistration, createGoal,
    GeneratorRegistration, goal,
    goalContributors, GoalInvocation,
    goals, hasFile,
    HasTravisFile, onAnyPush,
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
import {addTravisCodeTransformation} from "./addTravisCodeTransformation";
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

    const goal1 = createSleepGoal("Sleep goal 1", 2);
    const goal2 = createSleepGoal("Sleep goal 2", 15);
    const goal3 = createSleepGoal("Sleep goal 3", 2);
    const goal4 = createSleepGoal("Sleep goal 4", 10);
    const goal5 = createSleepGoal("Sleep goal 5", 10);
    const goal6 = createSleepGoal("Sleep goal 6", 8);
    const goal7 = createSleepGoal("Sleep goal 7", 12);
    const goal8 = createSleepGoal("Sleep goal 8", 30);
    const goal9 = createSleepGoal("app goal", 3);

    const phase1 = goals("sleep goals phase 1")
        .plan(goal1, goal2, goal8)
        .plan(goal3).after(goal1, goal2)
        .plan(goal4).after(goal3)

    sdm.withPushRules(
        whenPushSatisfies(hasFile(".travis.yml")).setGoals(goals("all sleep goals")
            .plan(phase1)
            .plan(goal5, goal6).after(phase1)
            .plan(goal7).after(goal5)
            .plan(goalWithApproval).after(goal8)
            .plan(goal9).after(goalWithApproval)));

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

const createSleepGoal = (name: string, sleepInSeconds: number = 5) => {
    return goal({
        displayName: name,
    }, async (inv: GoalInvocation) => {
        await timeout(sleepInSeconds * 1000);
    });
};

// helper function to create a timeout Promise
const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const goalWithApproval = createGoal({
    displayName: `approve me`,
    approvalRequired: true,
    waitingForApprovalDescription: "Please click to approve",
}, async (inv: GoalInvocation) => {
    await timeout(1 * 1000);
});
