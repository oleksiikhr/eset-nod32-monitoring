package nod32

type ApplicationInfo struct {
	ID     int `json:"id"`
	Result *ApplicationInfoResult
	Error  *ApplicationInfoError
}

type ApplicationInfoError struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type ApplicationInfoResult struct {
	Description string `json:"description"`
	Version     string `json:"version"`
	Product     string `json:"product"`
	LangID      int    `json:"lang_id"`
	Modules     []*ApplicationInfoResultModule
}

type ApplicationInfoResultModule struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Version     string `json:"version"`
	Date        string `json:"date"`
}

type UpdateStatus struct {
	ID     int `json:"id"`
	Result *UpdateStatusResult
	Error  *UpdateStatusError
}

type UpdateStatusError struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type UpdateStatusResult struct {
	LastUpdateTime           string `json:"last_update_time"`
	LastSuccessfulUpdateTime string `json:"last_successful_update_time"`
	LastUpdateResult         string `json:"last_update_result"`
}
