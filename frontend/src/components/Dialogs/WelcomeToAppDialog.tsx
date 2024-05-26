// components/WelcomeToAppDialog.js
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTranslation } from "next-i18next";

const WelcomeToAppDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="text-center">
        <p>{t("common:welcomeToQuizBuddy")}</p>
      </DialogTitle>
      <DialogContent>
        <div className="text-center">
          <div className="text-6xl mb-4">😍</div>
          <p className="text-lg">{t("common:welcomeToQuizBuddySubtitle")}</p>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("common:getStarted")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeToAppDialog;
