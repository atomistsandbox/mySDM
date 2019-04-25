import {DefaultHttpClientFactory, HttpMethod, MappedParameter, MappedParameters, Parameters} from "@atomist/automation-client";
import {defaultConfiguration, getUserConfig} from "@atomist/automation-client/lib/configuration";
import {AutoMergeMethod, AutoMergeMode, BranchCommit} from "@atomist/automation-client/lib/operations/edit/editModes";
import {CodeTransform, CodeTransformRegistration, CommandHandlerRegistration} from "@atomist/sdm";
import {ReportValuesParameters} from "./reportValuesCommand";

export const AddTravisFile: CodeTransform<AddRepositorySlug> = async (p, params) => {
    const dc = defaultConfiguration();
    const uc = getUserConfig();
    const TravisYAML = `language: java
notifications:
  webhooks:
    urls:
${ dc.workspaceIds.map(id => "      - https://webhook.atomist.com/atomist/travis/teams/" + id).join("\\n") }
    on_success: always
    on_failure: always
    on_start: always
    on_cancel: always
    on_error: always
`;

    const travisUrl = `https://api.travis-ci.org/repo/${params.parameters.githubOwner}%2F${params.parameters.githubRepository}/activate`;
    const httpClient = DefaultHttpClientFactory.create();
    await httpClient.exchange(travisUrl, {method: HttpMethod.Post, headers: {Authorization : `token ${uc.travis_token}`}});
    console.log("I want tjhe paranms: " + params);
    return p.addFile(".travis.yml", TravisYAML);
};

@Parameters()
export class AddRepositorySlug {

    @MappedParameter(MappedParameters.GitHubRepository)
    public githubRepository: string;

    @MappedParameter(MappedParameters.GitHubOwner)
    public githubOwner: string;
}

export const addTravisCodeTransformation: CodeTransformRegistration<AddRepositorySlug> = {
    name: "Add Travis YML",
    intent: "add travis yml",
    // transform: AddTAddTravisFile2ravisFile(sdm.configuration),
    transform: AddTravisFile,
    paramsMaker: AddRepositorySlug,
    transformPresentation: () => {
        const pr: BranchCommit = {
            message: "Add .travis.yml file",
            branch: "travis-yml",
            autoMerge: {
                mode: AutoMergeMode.SuccessfulCheck,
                method: AutoMergeMethod.Squash,
            },
        };
        return pr;
    }
};
