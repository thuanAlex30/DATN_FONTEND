import { useEffect, useCallback } from 'react';
// import { useDispatch } from 'react-redux'; // Reserved for future use
import websocketClient from '../services/websocketClient';

interface UseDataSyncOptions {
  onPPEItemCreated?: () => void;
  onPPEItemUpdated?: () => void;
  onPPEIssued?: () => void;
  onPPEReturned?: () => void;
  onProjectCreated?: () => void;
  onProjectUpdated?: () => void;
  onIncidentReported?: () => void;
  onIncidentUpdated?: () => void;
  onTrainingSessionCreated?: () => void;
  onTrainingCompleted?: () => void;
}

/**
 * Hook để tự động refresh data khi nhận WebSocket events
 * Giúp đảm bảo UI luôn hiển thị dữ liệu mới nhất
 */
export const useDataSync = (options: UseDataSyncOptions = {}) => {
  // const dispatch = useDispatch(); // Reserved for future use

  const refreshData = useCallback((callback?: () => void) => {
    if (callback) {
      callback();
    }
  }, []);

  useEffect(() => {
    // PPE Events
    const handlePPEItemCreated = () => {
      console.log('🔄 Refreshing PPE data due to item created');
      refreshData(options.onPPEItemCreated);
    };

    const handlePPEItemUpdated = () => {
      console.log('🔄 Refreshing PPE data due to item updated');
      refreshData(options.onPPEItemUpdated);
    };

    const handlePPEIssued = () => {
      console.log('🔄 Refreshing PPE data due to issuance');
      refreshData(options.onPPEIssued);
    };

    const handlePPEReturned = () => {
      console.log('🔄 Refreshing PPE data due to return');
      refreshData(options.onPPEReturned);
    };

    // Project Events
    const handleProjectCreated = () => {
      console.log('🔄 Refreshing project data due to creation');
      refreshData(options.onProjectCreated);
    };

    const handleProjectUpdated = () => {
      console.log('🔄 Refreshing project data due to update');
      refreshData(options.onProjectUpdated);
    };

    // Incident Events
    const handleIncidentReported = () => {
      console.log('🔄 Refreshing incident data due to report');
      refreshData(options.onIncidentReported);
    };

    const handleIncidentUpdated = () => {
      console.log('🔄 Refreshing incident data due to update');
      refreshData(options.onIncidentUpdated);
    };

    // Training Events
    const handleTrainingSessionCreated = () => {
      console.log('🔄 Refreshing training data due to session created');
      refreshData(options.onTrainingSessionCreated);
    };

    const handleTrainingCompleted = () => {
      console.log('🔄 Refreshing training data due to completion');
      refreshData(options.onTrainingCompleted);
    };

    // Register event listeners
    websocketClient.on('ppe_item_created', handlePPEItemCreated);
    websocketClient.on('ppe_item_updated', handlePPEItemUpdated);
    websocketClient.on('ppe_issued', handlePPEIssued);
    websocketClient.on('ppe_returned', handlePPEReturned);
    websocketClient.on('project_created', handleProjectCreated);
    websocketClient.on('project_updated', handleProjectUpdated);
    websocketClient.on('incident_reported', handleIncidentReported);
    websocketClient.on('incident_classified', handleIncidentUpdated);
    websocketClient.on('incident_assigned', handleIncidentUpdated);
    websocketClient.on('incident_progress_updated', handleIncidentUpdated);
    websocketClient.on('incident_closed', handleIncidentUpdated);
    websocketClient.on('training_session_created', handleTrainingSessionCreated);
    websocketClient.on('training_completed', handleTrainingCompleted);

    // Cleanup
    return () => {
      websocketClient.off('ppe_item_created', handlePPEItemCreated);
      websocketClient.off('ppe_item_updated', handlePPEItemUpdated);
      websocketClient.off('ppe_issued', handlePPEIssued);
      websocketClient.off('ppe_returned', handlePPEReturned);
      websocketClient.off('project_created', handleProjectCreated);
      websocketClient.off('project_updated', handleProjectUpdated);
      websocketClient.off('incident_reported', handleIncidentReported);
      websocketClient.off('incident_classified', handleIncidentUpdated);
      websocketClient.off('incident_assigned', handleIncidentUpdated);
      websocketClient.off('incident_progress_updated', handleIncidentUpdated);
      websocketClient.off('incident_closed', handleIncidentUpdated);
      websocketClient.off('training_session_created', handleTrainingSessionCreated);
      websocketClient.off('training_completed', handleTrainingCompleted);
    };
  }, [refreshData, options]);

  return {
    refreshData
  };
};

export default useDataSync;
