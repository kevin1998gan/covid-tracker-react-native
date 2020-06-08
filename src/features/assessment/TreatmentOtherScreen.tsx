import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import { Form, Item, Label, Text, Textarea } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import * as Yup from 'yup';

import ProgressStatus from '@covid/components/ProgressStatus';
import Screen, { FieldWrapper, Header, ProgressBlock } from '@covid/components/Screen';
import { BrandedButton, HeaderText, LabelText } from '@covid/components/Text';
import UserService from '@covid/core/user/UserService';
import i18n from '@covid/locale/i18n';
import AssessmentCoordinator from '@covid/features/assessment/AssessmentCoordinator';
import { assessmentService } from '@covid/Services';

import { ScreenParamList } from '../ScreenParamList';
import { colors } from '@theme';

const initialFormValues = {
  description: '',
};

interface TreatmentData {
  description: string;
}

type TreatmentOtherProps = {
  navigation: StackNavigationProp<ScreenParamList, 'TreatmentOther'>;
  route: RouteProp<ScreenParamList, 'TreatmentOther'>;
};

type State = {
  isFocused: boolean;
};

export default class TreatmentOtherScreen extends Component<TreatmentOtherProps, State> {
  constructor(props: TreatmentOtherProps) {
    super(props);
    AssessmentCoordinator.resetNavigation(props.navigation);
    this.handleUpdateTreatment = this.handleUpdateTreatment.bind(this);
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
    this.state = { isFocused: false };
  }

  registerSchema = Yup.object().shape({
    description: Yup.string(),
  });

  focus() {
    this.setState({ isFocused: true });
  }

  blur() {
    this.setState({ isFocused: false });
  }

  handleUpdateTreatment = async (formData: TreatmentData) => {
    const { assessmentId } = AssessmentCoordinator.assessmentData;
    let assessment;

    if (formData.description) {
      assessment = {
        treatment: formData.description,
      };
    }

    await assessmentService.completeAssessment(assessmentId!, assessment);
    AssessmentCoordinator.gotoNextScreen(this.props.route.name);
  };

  render() {
    const currentPatient = AssessmentCoordinator.assessmentData.currentPatient;
    const title =
      this.props.route.params.location === 'back_from_hospital'
        ? i18n.t('treatment-other-title-after')
        : i18n.t('treatment-other-title-during');
    const question =
      this.props.route.params.location === 'back_from_hospital'
        ? i18n.t('treatment-other-question-treatment-after')
        : i18n.t('treatment-other-question-treatment-during');

    return (
      <Screen profile={currentPatient.profile} navigation={this.props.navigation}>
        <Header>
          <HeaderText>{title}</HeaderText>
        </Header>

        <ProgressBlock>
          <ProgressStatus step={5} maxSteps={5} />
        </ProgressBlock>

        <Formik
          initialValues={initialFormValues}
          validationSchema={this.registerSchema}
          onSubmit={(values: TreatmentData) => {
            return this.handleUpdateTreatment(values);
          }}>
          {(props) => {
            return (
              <Form>
                <FieldWrapper style={{ marginVertical: 32 }}>
                  <LabelText>{question}</LabelText>
                  <Textarea
                    style={styles.textarea}
                    rowSpan={5}
                    bordered={this.state.isFocused}
                    placeholder={i18n.t('placeholder-optional-question')}
                    value={props.values.description}
                    onFocus={this.focus}
                    onChangeText={props.handleChange('description')}
                    onBlur={this.blur}
                    underline={false}
                  />
                </FieldWrapper>

                <BrandedButton onPress={props.handleSubmit}>
                  <Text>{i18n.t('completed')}</Text>
                </BrandedButton>
              </Form>
            );
          }}
        </Formik>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  textarea: {
    backgroundColor: colors.backgroundTertiary,
    borderColor: colors.primary,
    width: '100%',
    borderRadius: 8,
    marginTop: 8,
  },
});
