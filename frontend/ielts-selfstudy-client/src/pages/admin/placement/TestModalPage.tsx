import { useState } from 'react';
import PlacementTestFormModal from './PlacementTestFormModal';
import { Button } from '../../../components/ui';

export default function TestModalPage() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Modal Page</h1>
            <p className="mb-4">This is a simple test page to verify the modal works.</p>

            <Button onClick={() => setIsOpen(true)}>
                Open Modal (Create)
            </Button>

            <PlacementTestFormModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={() => {
                    alert('Success callback triggered');
                    setIsOpen(false);
                }}
                testId={null}
            />
        </div>
    );
}
