// @flow
import startCase from 'lodash/startCase'
import React, { useEffect, useState } from 'react'
import { RadioButton } from 'react-native-paper'
import { TouchableOpacity } from 'react-native'
import normalize from '../../lib/utils/normalizeText'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { BackButton } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { CustomButton, CustomDialog, Icon, Section, Text } from '../common'
import OptionsRow from './OptionsRow'

const TITLE = 'PROFILE PRIVACY'
const log = logger.child({ from: 'ProfilePrivacy' })

// privacy options
const privacyOptions = ['private', 'masked', 'public']
const tips = {
  private: 'Nobody will be able to see your field, nor to find you searching by it.',
  masked: 'Your field will be partially visible (e.g.: ****ple@***.com). Nobody will be able to search you by it.',
  public: 'Your field is publicly available. Anybody will be able to find you by it.',
}

// fields to manage privacy of
const profileFields = ['mobile', 'email']
const initialState = profileFields.reduce((acc, field) => ({ ...acc, [`${field}`]: '' }), {})
const titles = { mobile: 'Phone number', email: 'Email' }

const ProfilePrivacy = props => {
  const [initialPrivacy, setInitialPrivacy] = useState(initialState)
  const [privacy, setPrivacy] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const { screenProps, styles, theme } = props

  useEffect(() => {
    // looks for the users fields' privacy
    const privacyGatherer = async () => {
      const toUpdate = profileFields.map(field => userStorage.getProfileField(field))
      const fields = await Promise.all(toUpdate)

      // set the current privacy values
      fields.map(({ privacy }, index) => {
        setInitialPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
        setPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
      })
    }

    privacyGatherer()
  }, [])

  /**
   * filters the fields to be updated
   */
  const updatableValues = () => profileFields.filter(field => privacy[field] !== initialPrivacy[field])

  const handleSave = async () => {
    setLoading(true)

    try {
      // filters out fields to be updated
      const toUpdate = updatableValues().map(field => ({
        update: userStorage.setProfileFieldPrivacy(field, privacy[field]),
        field,
      }))

      // updates fields
      await Promise.all(toUpdate.map(({ update }) => update))

      // resets initial privacy states with currently set values
      toUpdate.map(({ field }) => setInitialPrivacy(prevState => ({ ...prevState, [`${field}`]: privacy[field] })))
    } catch (e) {
      log.error('Failed to save new privacy', { e })
    }

    setLoading(false)
  }

  return (
    <Section grow style={styles.wrapper}>
      <Section.Stack grow>
        <Section.Row grow justifyContent="center" style={styles.subtitleRow}>
          <Section.Text fontSize={16} fontWeight="bold" color={theme.colors.gray}>
            Manage your profile privacy
          </Section.Text>
          <InfoIcon style={styles.infoIcon} color={theme.colors.primary} onPress={() => setShowTips(true)} />
        </Section.Row>

        <Section style={styles.optionsRowContainer}>
          <OptionsRow />

          {profileFields.map(field => (
            <RadioButton.Group
              onValueChange={value => setPrivacy(prevState => ({ ...prevState, [`${field}`]: value }))}
              value={privacy[field]}
              key={field}
            >
              <OptionsRow title={titles[field]} />
            </RadioButton.Group>
          ))}
        </Section>
      </Section.Stack>

      <Section.Row grow alignItems="flex-end" style={styles.buttonsRow}>
        <BackButton mode="text" screenProps={screenProps} style={styles.growOne}>
          Cancel
        </BackButton>
        <CustomButton
          onPress={handleSave}
          mode="contained"
          loading={loading}
          disabled={updatableValues().length === 0}
          style={styles.growThree}
        >
          Save
        </CustomButton>
      </Section.Row>
      <CustomDialog visible={showTips} onDismiss={() => setShowTips(false)} title="TIPS" dismissText="Ok">
        {privacyOptions.map(field => (
          <Section.Stack grow key={field} style={styles.dialogTipItem}>
            <Text fontSize={18} color="primary" textAlign="left">
              {startCase(field)}
            </Text>
            <Text>{tips[field]}</Text>
          </Section.Stack>
        ))}
      </CustomDialog>
    </Section>
  )
}

/**
 * InfoIcon component
 * @param {object} props
 * @param {string} props.color
 * @param {Function} props.onPress
 * @param {number} props.size
 * @returns {ReactNode}
 * @constructor
 */
const InfoIcon = ({ color, onPress, size, style }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Icon size={size || 16} color={color} name="system-filled" />
  </TouchableOpacity>
)

const getStylesFromProps = ({ theme }) => {
  return {
    wrapper: {
      borderRadius: 0,
      padding: 0,
    },
    infoIcon: {
      marginLeft: '0.5em',
    },
    optionsRowContainer: {
      padding: 0,
      height: '70%',
    },
    growOne: {
      flexGrow: 1,
    },
    growThree: {
      flexGrow: 3,
    },
    subtitleRow: {
      height: '16%',
    },
    buttonsRow: {
      marginHorizontal: theme.paddings.mainContainerPadding,
      marginBottom: normalize(16),
    },
    dialogTipItem: {
      marginBottom: normalize(20),
    },
  }
}

const profilePrivacy = withStyles(getStylesFromProps)(ProfilePrivacy)

profilePrivacy.navigationOptions = {
  title: TITLE,
}

export default profilePrivacy