import { useSelector } from "react-redux";
import { Skeleton } from "@material-ui/lab";
import { Typography, Box } from "@material-ui/core";
import { trim, formatCurrency } from "../../../../helpers";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";
import { allBondsMap } from "src/helpers/AllBonds";

export const Metric = props => <Box className={`metric ${props.className}`}>{props.children}</Box>;

Metric.Value = props => <Typography variant="h5">{props.children || <Skeleton type="text" />}</Typography>;

Metric.Title = props => (
  <Typography variant="h6" color="textSecondary">
    {props.children}
  </Typography>
);

export const MarketCap = () => {
  const marketCap = useSelector(state => state.app.marketCap);

  return (
    <Metric className="market">
      <Metric.Title>Market Cap</Metric.Title>
      <Metric.Value>{marketCap && formatCurrency(marketCap, 0)}</Metric.Value>
    </Metric>
  );
};

export const OHMPrice = () => {
  const marketPrice = useSelector(state => state.app.marketPrice);

  return (
    <Metric className="price">
      <Metric.Title>EVHY Price</Metric.Title>
      <Metric.Value>{marketPrice && formatCurrency(marketPrice, 2)}</Metric.Value>
    </Metric>
  );
};

export const CircSupply = () => {
  // const circSupply = useSelector(state => state.app.circSupply);
  // const totalSupply = useSelector(state => state.app.totalSupply);
  const treasuryBalance = useSelector(state => {
    if (state.bonding.loading == false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances;
    }
  });

  // const isDataLoaded = circSupply && totalSupply;

  return (
    <Metric className="circ">
      <Metric.Title>Treasury Balance</Metric.Title>
      <Metric.Value>{treasuryBalance && formatCurrency(treasuryBalance, 2)}</Metric.Value>
    </Metric>
  );
};

export const BackingPerOHM = () => {
  const backingPerOhm = useSelector(state => state.app.treasuryMarketValue / state.app.circSupply);

  return (
    <Metric className="bpo">
      <Metric.Title>Backing per EVHY</Metric.Title>
      <Metric.Value>{!isNaN(backingPerOhm) && formatCurrency(backingPerOhm, 2)}</Metric.Value>
    </Metric>
  );
};

export const CurrentIndex = () => {
  const currentIndex = useSelector(state => state.app.currentIndex);

  return (
    <Metric className="index">
      <Metric.Title>
        Current Index
        <InfoTooltip message="The current index tracks the amount of sOHM accumulated since the beginning of staking. Basically, how much sOHM one would have if they staked and held a single OHM from day 1." />
      </Metric.Title>
      <Metric.Value>{currentIndex && trim(currentIndex, 2) + " sEVHY"}</Metric.Value>
    </Metric>
  );
};

export const WSOHMPrice = () => {
  const stakingTVL = useSelector(state => state.app.stakingTVL);
  return (
    <Metric className="wsoprice">
      <Metric.Title>TVL</Metric.Title>
      <Metric.Value>{stakingTVL && formatCurrency(stakingTVL, 2)}</Metric.Value>
      {/* <Metric.Value>{wsOhmPrice && formatCurrency(wsOhmPrice, 2)}</Metric.Value> */}
    </Metric>
  );
};
