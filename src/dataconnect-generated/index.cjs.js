const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'workspace',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createStationRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateStation');
}
createStationRef.operationName = 'CreateStation';
exports.createStationRef = createStationRef;

exports.createStation = function createStation(dc) {
  return executeMutation(createStationRef(dc));
};

const listStationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListStations');
}
listStationsRef.operationName = 'ListStations';
exports.listStationsRef = listStationsRef;

exports.listStations = function listStations(dc) {
  return executeQuery(listStationsRef(dc));
};

const updateSongRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSong', inputVars);
}
updateSongRef.operationName = 'UpdateSong';
exports.updateSongRef = updateSongRef;

exports.updateSong = function updateSong(dcOrVars, vars) {
  return executeMutation(updateSongRef(dcOrVars, vars));
};

const listMyProgramsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyPrograms');
}
listMyProgramsRef.operationName = 'ListMyPrograms';
exports.listMyProgramsRef = listMyProgramsRef;

exports.listMyPrograms = function listMyPrograms(dc) {
  return executeQuery(listMyProgramsRef(dc));
};
