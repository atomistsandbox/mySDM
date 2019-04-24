import {MappedParameter, MappedParameters, Parameters} from "@atomist/automation-client";
import {CommandHandlerRegistration} from "@atomist/sdm";

@Parameters()
export class ReportValuesParameters {
    // this seems to causse the SDM to fail
    // @MappedParameter("atomist://correlationId")
    // public correlationId: string;

    @MappedParameter(MappedParameters.GitHubApiUrl)
    public githubApiUrl: string;

    @MappedParameter(MappedParameters.GitHubUrl)
    public githubUrl: string;

    @MappedParameter(MappedParameters.GitHubWebHookUrl)
    public githubWebhookUrl: string;

    @MappedParameter(MappedParameters.GitHubDefaultRepositoryVisibility)
    public defaultRepoVisibility: string;

    @MappedParameter(MappedParameters.GitHubRepository)
    public githubRepository: string;

    @MappedParameter(MappedParameters.GitHubOwner)
    public githubOwner: string;

    @MappedParameter(MappedParameters.GitHubRepositoryProvider)
    public githubProvider: string;

    @MappedParameter(MappedParameters.GitHubUserLogin)
    public githubUsername: string;

    @MappedParameter(MappedParameters.SlackChannel)
    public slackChannelId: string;

    @MappedParameter(MappedParameters.SlackChannelName)
    public slackChannelName: string;

    @MappedParameter(MappedParameters.SlackTeam)
    public slackTeamId: string;

    @MappedParameter(MappedParameters.SlackUser)
    public slackUserId: string;

    @MappedParameter(MappedParameters.SlackUserName)
    public slackUserName: string;
}

export const reportValuesCommand: CommandHandlerRegistration<ReportValuesParameters> = {
    name: "ReportValues",
    description: "report values",
    intent: "report values",
    paramsMaker: ReportValuesParameters,
    listener: async cli => {

        const message =
            // `Correlation Id: ${cli.parameters.correlationId}\n` +
            `Github API URL: ${cli.parameters.githubApiUrl}\n` +
            `Github URL: ${cli.parameters.githubUrl}\n` +
            `Github Webhook URL: ${cli.parameters.githubWebhookUrl}\n` +
            `Default Repo Visibility: ${cli.parameters.defaultRepoVisibility}\n` +
            `Github Repository: ${cli.parameters.githubRepository}\n` +
            `Github Owner: ${cli.parameters.githubOwner}\n` +
            `Github Provider: ${cli.parameters.githubProvider}\n` +
            `Github Username: ${cli.parameters.githubUsername}\n` +
            `Chat Channel Id: ${cli.parameters.slackChannelId}\n` +
            `Chat Channel Name: ${cli.parameters.slackChannelName}\n` +
            `Chat Team Id: ${cli.parameters.slackTeamId}\n` +
            `Chat User Id: ${cli.parameters.slackUserId}\n` +
            `Chat User Name: ${cli.parameters.slackUserName}\n`;

        const slackMessage = {
            text: `Report values`,
            attachments: [{
                fallback: `Report values`,
                mrkdwn_in: ["value"],
                text: message,
            }],
        };

        return cli.addressChannels(slackMessage);
    },
};
