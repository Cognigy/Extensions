export interface AccessToken {
    access_token: string;
    id_token:     string;
    scope:        string;
    expires_in:   number;
    token_type:   string;
    result:       string;    
}

export interface AddTransactionItem {
    "@odata.context":                   string;
    QueueDefinitionId:                  number;
    OutputData:                         null;
    AnalyticsData:                      null;
    Status:                             string;
    ReviewStatus:                       string;
    ReviewerUserId:                     null;
    Key:                                string;
    Reference:                          string;
    ProcessingExceptionType:            null;
    DueDate:                            null;
    RiskSlaDate:                        null;
    Priority:                           string;
    DeferDate:                          null;
    StartProcessing:                    null;
    EndProcessing:                      null;
    SecondsInPreviousAttempts:          number;
    AncestorId:                         null;
    RetryNumber:                        number;
    SpecificData:                       string;
    CreationTime:                       string;
    Progress:                           null;
    RowVersion:                         string;
    OrganizationUnitId:                 number;
    OrganizationUnitFullyQualifiedName: null;
    Id:                                 number;
    ProcessingException:                null;
    SpecificContent:                    any;
    Output:                             null;
    Analytics:                          null;
}

export interface StartJob {
    "@odata.context": string;
    value:            JobValue[];
}

export interface JobValue {
    Key:                                string;
    StartTime:                          null;
    EndTime:                            null;
    State:                              string;
    JobPriority:                        string;
    Source:                             string;
    SourceType:                         string;
    BatchExecutionKey:                  string;
    Info:                               null;
    CreationTime:                       string;
    StartingScheduleId:                 null;
    ReleaseName:                        string;
    Type:                               string;
    InputArguments:                     null;
    OutputArguments:                    null;
    HostMachineName:                    string;
    HasMediaRecorded:                   boolean;
    PersistenceId:                      null;
    ResumeVersion:                      null;
    StopStrategy:                       null;
    RuntimeType:                        null;
    RequiresUserInteraction:            boolean;
    ReleaseVersionId:                   null;
    EntryPointPath:                     null;
    OrganizationUnitId:                 number;
    OrganizationUnitFullyQualifiedName: null;
    Reference:                          string;
    Id:                                 number;
}

export interface TransactionData {
    "@odata.context": string;
    "@odata.count":   number;
    value:            TransactionValue[];
}

export interface TransactionValue {
    QueueDefinitionId:                  number;
    OutputData:                         string;
    AnalyticsData:                      null;
    Status:                             string;
    ReviewStatus:                       string;
    ReviewerUserId:                     null;
    Key:                                string;
    Reference:                          string;
    ProcessingExceptionType:            null;
    DueDate:                            null;
    RiskSlaDate:                        null;
    Priority:                           string;
    DeferDate:                          null;
    StartProcessing:                    string;
    EndProcessing:                      string;
    SecondsInPreviousAttempts:          number;
    AncestorId:                         null;
    RetryNumber:                        number;
    SpecificData:                       string;
    CreationTime:                       string;
    Progress:                           null;
    RowVersion:                         string;
    OrganizationUnitId:                 number;
    OrganizationUnitFullyQualifiedName: string;
    Id:                                 number;
    ProcessingException:                null;
    SpecificContent:                    any;
    Output:                             any;
    Analytics:                          null;
}