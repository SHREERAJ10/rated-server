import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import serviceAccount  from '../../ServiceAccountKey.json' with {type:"json"};
import { getAuth } from 'firebase-admin/auth';

initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
});

export const auth = getAuth();