import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./alert-dialog";

interface ContinueModalProps {
	open: boolean;
	onClose: () => void;
	onContinue: () => void;
	onRestart: () => void;
}

export function ContinueGameModal({
	open,
	onClose,
	onContinue,
	onRestart,
}: ContinueModalProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={onClose}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Continuer l’aventure ?</AlertDialogTitle>
					<AlertDialogDescription>
						Tu as déjà une partie en cours sur cette histoire. Tu veux reprendre
						où tu t’étais arrêté ou recommencer depuis le début ?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>

					<AlertDialogAction
						onClick={onContinue}
						className="bg-indigo-600 hover:bg-indigo-700 text-white"
					>
						Continuer
					</AlertDialogAction>

					<AlertDialogAction
						onClick={onRestart}
						className="bg-red-600 hover:bg-red-700 text-white ml-2"
					>
						Recommencer
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
