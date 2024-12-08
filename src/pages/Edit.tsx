import { useNavigate, useLocation } from 'react-router-dom';
import TextEditView from '@/components/TextEditView';

interface LocationState {
  text: string;
}

const Edit = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state?.text) {
    navigate('/');
    return null;
  }

  return (
    <TextEditView
      text={state.text}
      onBack={() => navigate('/')}
      onNewRecording={() => navigate('/')}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default Edit; 