import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

const StoryNode = ({ data }: { data: { title: string; content: string; isEnding?: boolean } }) => {
    return (
        <div className={`px-4 py-2 shadow-md rounded-md border-2 bg-gray-800 text-white min-w-[150px] ${data.isEnding ? 'border-red-500' : 'border-indigo-500'}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

            <div className="font-bold text-sm mb-1 border-b border-gray-600 pb-1">
                {data.title || 'Untitled Page'}
            </div>

            <div className="text-xs text-gray-300 line-clamp-3">
                {data.content || 'No content...'}
            </div>

            {data.isEnding && (
                <div className="mt-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                    Ending
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    );
};

export default memo(StoryNode);
