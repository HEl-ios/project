
import React, { useState, useCallback, useEffect } from 'react';
import { View, Badge, BadgeSlug, HistoryItem, WasteClassificationResult, ReportHistoryItem, ReportStatus, PenaltyStatus, Community, CommunityMember, CommunityMessage, Building, Penalty, Warning, PickupRequest, PickupStatus, BulkPickupRequest, BulkPickupStatus, ComplianceReport, Vehicle, VehicleStatus, EquipmentRequest } from './types.ts';
import { BADGE_DEFINITIONS } from './constants.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import WasteClassifier from './components/WasteClassifier.tsx';
import FacilityLocator from './components/FacilityLocator.tsx';
import Quiz from './components/Quiz.tsx';
import ReportWaste from './components/ReportWaste.tsx';
import Chatbot from './components/Chatbot.tsx';
import UserProfile from './components/UserProfile.tsx';
import BottomNavBar from './components/BottomNavBar.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import TransparencyDashboard from './components/TransparencyDashboard.tsx';
import TrainingHub from './components/training/TrainingHub.tsx';
import CommunityHub from './components/CommunityHub.tsx';
import BuildingStatus from './components/BuildingStatus.tsx';
import Marketplace from './components/Marketplace.tsx';
import B2BPortal from './components/B2BPortal.tsx';
import { useTranslation } from './i18n/useTranslation.ts';
import { moderateChatMessage } from './services/geminiService.ts';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<Set<BadgeSlug>>(new Set());
  const [reportCount, setReportCount] = useState<number>(0);
  
  const { language } = useTranslation();

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('appHistory');
      if (savedHistory) {
          return JSON.parse(savedHistory).map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }));
      }
      return [];
    } catch (error) {
      console.error("Could not parse history from localStorage", error);
      return [];
    }
  });
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'Eco-Warrior');
  const [buildingId, setBuildingId] = useState<string>(() => localStorage.getItem('buildingId') || '');
  const [communities, setCommunities] = useState<Community[]>(() => {
      try {
        const saved = localStorage.getItem('communities');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  const [communityMembers, setCommunityMembers] = useState<Record<string, CommunityMember[]>>(() => {
    try {
        const saved = localStorage.getItem('communityMembers');
        return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [communityMessages, setCommunityMessages] = useState<Record<string, CommunityMessage[]>>(() => {
    try {
        const saved = localStorage.getItem('communityMessages');
        return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  // Mock Data for Admin/Building Features
   const [buildings, setBuildings] = useState<Building[]>(() => {
        const saved = localStorage.getItem('buildings');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'BLD001', name: 'Greenview Apartments', address: '123 Park Lane', status: 'Compliant', warnings: [], penalties: [] },
            { id: 'BLD002', name: 'Sunrise Towers', address: '456 Main St', status: 'WarningIssued', warnings: [{id: 'W01', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), reason: 'Improper segregation observed on multiple occasions.'}], penalties: [] },
        ];
    });

    const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
        const saved = localStorage.getItem('pickupRequests');
        return saved ? JSON.parse(saved).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) : [];
    });
    
    const [bulkPickupRequests, setBulkPickupRequests] = useState<BulkPickupRequest[]>(() => {
        const saved = localStorage.getItem('bulkPickupRequests');
        return saved ? JSON.parse(saved).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) : [];
    });

    const [vehicles, setVehicles] = useState<Vehicle[]>([
        { id: 'V01', currentLocation: { latitude: 28.615, longitude: 77.21 }, status: VehicleStatus.IDLE },
        { id: 'V02', currentLocation: { latitude: 28.610, longitude: 77.205 }, status: VehicleStatus.IDLE },
    ]);

    const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);


  useEffect(() => {
    localStorage.setItem('appHistory', JSON.stringify(history));
  }, [history]);
  
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('buildingId', buildingId);
  }, [buildingId]);

  useEffect(() => {
    localStorage.setItem('communities', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('communityMembers', JSON.stringify(communityMembers));
  }, [communityMembers]);
  
  useEffect(() => {
    localStorage.setItem('communityMessages', JSON.stringify(communityMessages));
  }, [communityMessages]);
  
   useEffect(() => {
    localStorage.setItem('buildings', JSON.stringify(buildings));
  }, [buildings]);

  useEffect(() => {
      localStorage.setItem('pickupRequests', JSON.stringify(pickupRequests));
  }, [pickupRequests]);

  useEffect(() => {
      localStorage.setItem('bulkPickupRequests', JSON.stringify(bulkPickupRequests));
  }, [bulkPickupRequests]);

  const addPoints = useCallback((points: number) => {
    setUserPoints(prev => prev + points);
  }, []);

  const unlockBadge = useCallback((slug: BadgeSlug) => {
    if (!unlockedBadges.has(slug)) {
      setUnlockedBadges(prev => new Set(prev).add(slug));
      const badge = BADGE_DEFINITIONS.find(b => b.slug === slug);
      if (badge) {
        addPoints(badge.points);
      }
    }
  }, [unlockedBadges, addPoints]);

  const addClassificationToHistory = useCallback((result: WasteClassificationResult) => {
    const newItem: HistoryItem = {
      id: `cls-${Date.now()}`,
      type: 'classification',
      timestamp: new Date(),
      data: result,
    };
    setHistory(prev => [newItem, ...prev]);
  }, []);
  
  const addReportToHistory = useCallback((reportData: Omit<ReportHistoryItem['data'], 'status' | 'penaltyStatus'> & Partial<Pick<ReportHistoryItem['data'], 'analysis'>>) => {
    const newItem: HistoryItem = {
        id: `report-${Date.now()}`,
        type: 'report',
        timestamp: new Date(),
        data: {
            ...reportData,
            status: 'Pending',
            penaltyStatus: 'None',
        },
    };
    setHistory(prev => [newItem, ...prev]);
}, []);

  const incrementReportCount = useCallback(() => {
    setReportCount(prev => prev + 1);
  }, []);

  const updateReportStatus = (reportId: string, newStatus: ReportStatus) => {
    setHistory(prevHistory => prevHistory.map(item =>
        item.id === reportId && item.type === 'report'
            ? { ...item, data: { ...item.data, status: newStatus } }
            : item
    ));
  };
  
  const updateReportPenaltyStatus = (reportId: string, newStatus: PenaltyStatus) => {
      setHistory(prevHistory => prevHistory.map(item =>
          item.id === reportId && item.type === 'report'
              ? { ...item, data: { ...item.data, penaltyStatus: newStatus } }
              : item
      ));
  };

  const assignBuildingToReport = (reportId: string, buildingId: string) => {
      setHistory(prevHistory => prevHistory.map(item =>
          item.id === reportId && item.type === 'report'
              ? { ...item, data: { ...item.data, buildingId: buildingId } }
              : item
      ));
  };

  const addWarningToBuilding = (buildingId: string, reason: string) => {
    setBuildings(prev => prev.map(b => {
        if (b.id === buildingId) {
            const newWarning: Warning = { id: `W${Date.now()}`, timestamp: new Date().toISOString(), reason };
            return { ...b, warnings: [newWarning, ...b.warnings], status: 'WarningIssued' };
        }
        return b;
    }));
  };

  const addPenaltyToBuilding = (buildingId: string, penalty: Omit<Penalty, 'id' | 'timestamp' | 'isResolved'>) => {
      setBuildings(prev => prev.map(b => {
          if (b.id === buildingId) {
              const newPenalty: Penalty = { ...penalty, id: `P${Date.now()}`, timestamp: new Date().toISOString(), isResolved: false };
              return { ...b, penalties: [newPenalty, ...b.penalties], status: 'PenaltyActive' };
          }
          return b;
      }));
  };
  
  const createCommunity = (name: string, description: string, areaName: string) => {
      const communityName = `${name} (${areaName})`;
      const newCommunity: Community = {
          id: `comm-${Date.now()}`,
          name: communityName,
          description,
          creatorId: 'user-001', // Mock user ID
          creatorName: userName,
          timestamp: new Date().toISOString(),
      };
      setCommunities(prev => [newCommunity, ...prev]);
      // Automatically add creator to the community
      joinCommunity(newCommunity.id);
      return newCommunity;
  };
  
  const joinCommunity = (communityId: string) => {
      setCommunityMembers(prev => {
          const members = prev[communityId] || [];
          if (!members.some(m => m.userId === 'user-001')) {
              return { ...prev, [communityId]: [...members, { userId: 'user-001', userName: userName }] };
          }
          return prev;
      });
  };
  
  const sendMessage = async (communityId: string, text: string): Promise<{ success: boolean; reason?: string; }> => {
      const moderationResult = await moderateChatMessage(text, language);
      if (!moderationResult.isAppropriate) {
          return { success: false, reason: moderationResult.reason };
      }
      const newMessage: CommunityMessage = {
          id: `msg-${Date.now()}`,
          communityId,
          senderId: 'user-001',
          senderName: userName,
          text,
          timestamp: new Date().toISOString(),
      };
      setCommunityMessages(prev => {
          const messages = prev[communityId] || [];
          return { ...prev, [communityId]: [...messages, newMessage] };
      });
      return { success: true };
  };

    const addPickupRequest = (requestData: Omit<PickupRequest, 'id' | 'userId' | 'timestamp' | 'status'>) => {
        const newRequest: PickupRequest = {
            id: `pr-${Date.now()}`,
            userId: 'user-001',
            timestamp: new Date().toISOString(),
            status: 'Pending',
            ...requestData,
        };
        setPickupRequests(prev => [newRequest, ...prev]);
    };
    
    const updatePickupStatus = (requestId: string, status: PickupStatus) => {
        setPickupRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    };

    const addBulkPickupRequest = (requestData: Omit<BulkPickupRequest, 'id' | 'businessId' | 'timestamp' | 'status'>) => {
        const newRequest: BulkPickupRequest = {
            id: `bpr-${Date.now()}`,
            businessId: 'business-001',
            timestamp: new Date().toISOString(),
            status: 'Requested',
            ...requestData,
        };
        setBulkPickupRequests(prev => [newRequest, ...prev]);
    };

    const updateBulkPickupStatus = (requestId: string, status: BulkPickupStatus) => {
        setBulkPickupRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    };
    
    const dispatchVehicleToReport = (vehicleId: string, reportId: string) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? {...v, status: VehicleStatus.EN_ROUTE, assignedReportId: reportId} : v));
        updateReportStatus(reportId, 'In Progress');

        // Simulate vehicle movement
        const report = history.find(r => r.id === reportId);
        if(report && report.type === 'report' && report.data.location) {
            const reportLocation = report.data.location;
             setTimeout(() => {
                setVehicles(prev => prev.map(v => v.id === vehicleId ? {...v, currentLocation: reportLocation, status: VehicleStatus.COLLECTING } : v));
             }, 5000); // 5 seconds to reach
             setTimeout(() => {
                setVehicles(prev => prev.map(v => v.id === vehicleId ? {...v, status: VehicleStatus.IDLE, assignedReportId: undefined } : v));
                updateReportStatus(reportId, 'Resolved');
             }, 10000); // 5 seconds to collect and become idle
        }
    };

    const addEquipmentRequest = (items: string[], authorityName: string) => {
        const newRequest: EquipmentRequest = {
            id: `eq-${Date.now()}`,
            workerId: 'user-001',
            items,
            authorityName,
            status: 'Pending',
            timestamp: new Date().toISOString(),
        };
        setEquipmentRequests(prev => [newRequest, ...prev]);
    };

  useEffect(() => {
    // Give initial points
    if (userPoints === 0) {
      setUserPoints(50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if(reportCount === 1) unlockBadge('eco-reporter');
    if(reportCount === 3) unlockBadge('community-helper');
  }, [reportCount, unlockBadge]);
  
  const unlockedBadgesArray = Array.from(unlockedBadges).map(slug => BADGE_DEFINITIONS.find(b => b.slug === slug)).filter((b): b is Badge => !!b);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={setCurrentView} userPoints={userPoints} unlockedBadges={unlockedBadgesArray} history={history} userName={userName} />;
      case View.CLASSIFIER:
        return <WasteClassifier unlockBadge={unlockBadge} addPoints={addPoints} addClassificationToHistory={addClassificationToHistory}/>;
      case View.LOCATOR:
        return <FacilityLocator />;
      case View.QUIZ:
        return <Quiz unlockBadge={unlockBadge}/>;
      case View.REPORT:
        return <ReportWaste incrementReportCount={incrementReportCount} addReportToHistory={addReportToHistory} addPoints={addPoints} />;
      case View.CHATBOT:
        return <Chatbot unlockBadge={unlockBadge} />;
      case View.PROFILE:
        return <UserProfile userName={userName} setUserName={setUserName} buildingId={buildingId} setBuildingId={setBuildingId} />;
      case View.ADMIN_DASHBOARD:
        return <AdminDashboard 
                    reports={history.filter(item => item.type === 'report') as ReportHistoryItem[]} 
                    updateReportStatus={updateReportStatus}
                    updateReportPenaltyStatus={updateReportPenaltyStatus}
                    assignBuildingToReport={assignBuildingToReport}
                    buildings={buildings}
                    addWarningToBuilding={addWarningToBuilding}
                    addPenaltyToBuilding={addPenaltyToBuilding}
                    vehicles={vehicles}
                    dispatchVehicleToReport={dispatchVehicleToReport}
                />;
      case View.TRANSPARENCY_DASHBOARD:
        return <TransparencyDashboard reports={history.filter(item => item.type === 'report') as ReportHistoryItem[]} />;
      case View.TRAINING:
        return <TrainingHub addPoints={addPoints} unlockBadge={unlockBadge} addEquipmentRequest={addEquipmentRequest}/>;
      case View.COMMUNITY:
        return <CommunityHub 
                    userId="user-001"
                    userName={userName}
                    communities={communities} 
                    communityMembers={communityMembers}
                    communityMessages={communityMessages}
                    createCommunity={createCommunity}
                    joinCommunity={joinCommunity}
                    sendMessage={sendMessage}
                />;
      case View.BUILDING_STATUS:
        return <BuildingStatus buildingId={buildingId} buildings={buildings} />;
      case View.MARKETPLACE:
        return <Marketplace 
                  userId="user-001"
                  pickupRequests={pickupRequests}
                  addPickupRequest={addPickupRequest}
                  updatePickupStatus={updatePickupStatus}
                  addPoints={addPoints}
                />;
      case View.B2B_PORTAL:
          return <B2BPortal 
                    businessId="business-001"
                    requests={bulkPickupRequests}
                    addRequest={addBulkPickupRequest}
                    updateRequestStatus={updateBulkPickupStatus}
                    addPoints={addPoints}
                  />;
      default:
        return <Dashboard setView={setCurrentView} userPoints={userPoints} unlockedBadges={unlockedBadgesArray} history={history} userName={userName} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setView={setCurrentView} userPoints={userPoints} currentView={currentView} />
      <main className="py-8 px-4 sm:px-6 lg:px-8 pb-28">
         <div className="page-transition-wrapper">
          {renderView()}
        </div>
      </main>
      <BottomNavBar currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
