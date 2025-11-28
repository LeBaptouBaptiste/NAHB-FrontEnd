import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { Image, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface StoryNodeData {
    title: string;
    content: string;
    isEnding?: boolean;
    endingType?: 'success' | 'failure' | 'neutral';
    image?: string;
    choices?: { text: string; targetPageId: string }[];
}

const StoryNode = ({ data }: { data: StoryNodeData }) => {
    // Determine border and badge colors based on ending type
    const getBorderColor = () => {
        if (!data.isEnding) return 'border-indigo-500';
        switch (data.endingType) {
            case 'success':
                return 'border-green-500';
            case 'failure':
                return 'border-red-500';
            default:
                return 'border-gray-500';
        }
    };

    const getEndingBadge = () => {
        if (!data.isEnding) return null;

        switch (data.endingType) {
            case 'success':
                return (
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-green-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Success
                    </div>
                );
            case 'failure':
                return (
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                        <XCircle className="w-3 h-3" />
                        Failure
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <MinusCircle className="w-3 h-3" />
                        Ending
                    </div>
                );
        }
    };

    return (
        <div
            className={`px-4 py-2 shadow-md rounded-md border-2 bg-gray-800 text-white min-w-[180px] max-w-[220px] ${getBorderColor()}`}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

            <div className="font-bold text-sm mb-1 border-b border-gray-600 pb-1 flex items-center justify-between">
                <span className="truncate">{data.title || 'Untitled Page'}</span>
                {data.image && <Image className="w-3 h-3 text-blue-400 flex-shrink-0 ml-1" />}
            </div>

            <div className="text-xs text-gray-300 line-clamp-3 min-h-[3em]">
                {data.content || 'No content...'}
            </div>

            {getEndingBadge()}

            {!data.isEnding && data.choices && data.choices.length > 0 && (
                <div className="mt-2 text-xs text-indigo-300">
                    {data.choices.length} {data.choices.length === 1 ? 'choice' : 'choices'}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    );
};

export default memo(StoryNode);

