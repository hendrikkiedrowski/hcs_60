import {createMuiTheme} from "@material-ui/core/styles";
import {lightBlue} from "@material-ui/core/colors";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#9ccc65',
    },
    secondary: lightBlue,
    fontColor: {
      main: '#ffffff'
    },
  },
});