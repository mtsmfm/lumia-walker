import Badge from "@material-ui/core/Badge";
import { withStyles } from "@material-ui/core/styles";

export const ItemBadge = withStyles(() => ({
  badge: {
    top: "unset",
    left: "unset",
    right: 0,
    bottom: 0,
    transform: "none",
  },
}))(Badge);
