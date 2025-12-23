import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'workspace',
  location: 'us-central1'
};

export const createStationRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateStation');
}
createStationRef.operationName = 'CreateStation';

export function createStation(dc) {
  return executeMutation(createStationRef(dc));
}

export const listStationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListStations');
}
listStationsRef.operationName = 'ListStations';

export function listStations(dc) {
  return executeQuery(listStationsRef(dc));
}

export const updateSongRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSong', inputVars);
}
updateSongRef.operationName = 'UpdateSong';

export function updateSong(dcOrVars, vars) {
  return executeMutation(updateSongRef(dcOrVars, vars));
}

export const listMyProgramsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyPrograms');
}
listMyProgramsRef.operationName = 'ListMyPrograms';

export function listMyPrograms(dc) {
  return executeQuery(listMyProgramsRef(dc));
}

