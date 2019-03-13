// @flow
import React, { useCallback } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { Section, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'
import TopBar from '../common/TopBar'
import { weiToMask, maskToWei } from '../../lib/wallet/utils'
import CurrencyInput from 'react-currency-input'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const InputGoodDollar = props => {
  return (
    <TextInput
      {...props}
      step="0.01"
      placeholder="0"
      value={weiToMask(props.wei)}
      onChangeText={text => {
        props.onChangeWei(maskToWei(text))
      }}
    />
  )
}

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState, setScreenState] = useScreenState(screenProps)

  const { amount, to } = screenState || {}
  const handleAmountChange = useCallback((value: string) => setScreenState({ amount: parseInt(value) }), ['0'])

  // const handleAmountChange = value => {
  //   console.log({ value })
  //   setScreenState({ amount: value })
  // }
  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>How much?</Section.Title>
            <View style={styles.amountWrapper}>
              <Text style={styles.amountInputWrapper}>
                <InputGoodDollar
                  focus="true"
                  wei={amount}
                  onChangeWei={handleAmountChange}
                  style={styles.amountInput}
                />
              </Text>
              <Text style={styles.amountSuffix}>GD</Text>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <NextButton nextRoutes={screenState.nextRoutes} values={{ amount, to }} disabled={!amount} {...props} />
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Amount.navigationOptions = {
  title: RECEIVE_TITLE
}

export default Amount
