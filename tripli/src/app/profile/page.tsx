import { useEffect } from 'react';
import {useRouter} from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.push('/profile/id'); //will eventually change id to acc user id
    }, [router]);
    return <div>Redirecting to your profile...</div>;
}