import { ElementType, useState } from "react";
import {
  SvgIcon,
  Button,
  Typography,
  Box,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails,
  withStyles,
  useTheme,
} from "@material-ui/core";

import { useAppSelector } from "src/hooks";
import { useWeb3Context } from "src/hooks/web3Context";
import { addresses } from "src/constants";
import { trim, formatCurrency } from "src/helpers";
import { RootState } from "src/store";

import { ReactComponent as MoreIcon } from "src/assets/icons/more.svg";
import OhmImg from "src/assets/tokens/token_OHM.svg";
import SOhmImg from "src/assets/tokens/token_sOHM.svg";
import WsOhmImg from "src/assets/tokens/token_wsOHM.svg";
import Token33tImg from "src/assets/tokens/token_33T.svg";
import GOhmImg from "src/assets/tokens/gohm.png";

import { segmentUA } from "src/helpers/userAnalyticHelpers";

const Accordion = withStyles({
  root: {
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: 0,
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles(theme => ({
  root: {
    minHeight: "36px",
    height: "36px",
    padding: theme.spacing(0),
    "&$expanded": {
      padding: theme.spacing(0),
      minHeight: "36px",
    },
  },
  content: {
    margin: 0,
    "&$expanded": {
      margin: 0,
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

interface Token {
  symbol: string;
  address: string;
  decimals: number;
  icon: string;
  balance: number;
  price: number;
}

const addTokenToWallet = async (token: Token, userAddress: string) => {
  if (!window.ethereum) return;
  const host = window.location.origin;
  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: `${host}/${token.icon}`,
        },
      },
    });
    segmentUA({
      address: userAddress,
      type: "Add Token",
      tokenName: token.symbol,
    });
  } catch (error) {
    console.log(error);
  }
};

interface TokenProps extends Token {
  expanded: boolean;
  onChangeExpanded: (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  onAddTokenToWallet: () => void;
}

export const Token = ({ symbol, icon, balance, price, onAddTokenToWallet, expanded, onChangeExpanded }: TokenProps) => {
  const theme = useTheme();
  const balanceValue = balance * price || 0;
  return (
    <Accordion expanded={expanded} onChange={onChangeExpanded}>
      <AccordionSummary expandIcon={<SvgIcon component={MoreIcon} color="disabled" />}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <img src={icon} style={{ height: "28px", width: "28px", marginRight: theme.spacing(1) }} />
          <Typography>{symbol}</Typography>
        </Box>
        <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            {trim(Number(balance), 4)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatCurrency(balanceValue, 2)}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails style={{ margin: "auto", padding: theme.spacing(0.5, 0) }}>
        <Box className="ohm-pairs" style={{ width: "100%" }}>
          <Button variant="contained" color="secondary" fullWidth onClick={onAddTokenToWallet}>
            <Typography>Add to Wallet</Typography>
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const tokensSelector = (state: RootState): Token[] => [
  {
    symbol: "OHM",
    address: addresses[state.network.networkId].OHM_ADDRESS,
    balance: parseFloat(state.account.balances.ohm),
    price: state.app.marketPrice || 0,
    icon: OhmImg,
    decimals: 9,
  },
  {
    symbol: "sOHM",
    address: addresses[state.network.networkId].SOHM_ADDRESS,
    balance: parseFloat(state.account.balances.sohm),
    price: state.app.marketPrice || 0,
    icon: SOhmImg,
    decimals: 9,
  },
  {
    symbol: "wsOHM",
    address: addresses[state.network.networkId].WSOHM_ADDRESS,
    balance: parseFloat(state.account.balances.wsohm),
    price: (state.app.marketPrice || 0) * Number(state.app.currentIndex),
    icon: WsOhmImg,
    decimals: 18,
  },
  {
    symbol: "33T",
    address: addresses[state.network.networkId].PT_TOKEN_ADDRESS,
    balance: parseFloat(state.account.balances.pool),
    price: state.app.marketPrice || 0,
    icon: Token33tImg,
    decimals: 9,
  },
  {
    symbol: "gOHM",
    address: addresses[state.network.networkId].GOHM_ADDRESS,
    balance: Object.values(state.account.balances.gohm).reduce(
      (total, networkGOhmBalance) => total + (parseFloat(networkGOhmBalance) || 0),
      0,
    ),
    price: state.app.marketPrice || 0,
    icon: GOhmImg,
    decimals: 9,
  },
];

export const useTokens = () => {
  return useAppSelector(tokensSelector);
};

export const Tokens = () => {
  const tokens = useTokens();
  const { address: userAddress } = useWeb3Context();
  const [expanded, setExpanded] = useState<string | null>(null);
  return tokens.map(token => (
    <Token
      {...token}
      expanded={expanded === token.symbol}
      onChangeExpanded={(e, isExpanded) => setExpanded(isExpanded ? token.symbol : null)}
      onAddTokenToWallet={() => addTokenToWallet(token, userAddress)}
    />
  ));
};
