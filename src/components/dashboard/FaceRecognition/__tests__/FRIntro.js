import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedFRIntro from '../FRIntro'

const FRIntro = withThemeProvider(ImportedFRIntro)

describe('FRIntro', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<FRIntro screenProps={{ screenState: {} }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FRIntro screenProps={{ screenState: {} }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
