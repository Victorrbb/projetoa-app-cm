import * as React from 'react';
import {
  TextInput,
  Text,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,Vibration
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // Importar NavigationContainer
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Stack = createStackNavigator();

class Principal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usuario: undefined,
      senha: undefined,
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Usuário:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(texto) => this.setState({ usuario: texto })}
          placeholder="Digite seu usuário"
          placeholderTextColor="#AFAFAF"
        />
        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(texto) => this.setState({ senha: texto })}
          secureTextEntry
          placeholder="Digite sua senha"
          placeholderTextColor="#AFAFAF"
        />
        <View style={styles.buttonContainer}>
          <Button title="Logar" onPress={() => this.ler()} color="#DAA520" />
        </View>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Criar Usuário')}>
          <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async ler() {
    try {
      let senha = await AsyncStorage.getItem(this.state.usuario);
      if (senha != null && senha === this.state.senha) {
        // Passando o usuário corretamente para a Home
        this.props.navigation.navigate('Home', { usuario: this.state.usuario });
      } else {
        alert('Usuário ou senha incorretos!');
      }
    } catch (erro) {
      console.log(erro);
    }
  }
}

class Cadastro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      password: undefined,
    };
  }

  async gravar() {
    try {
      await AsyncStorage.setItem(this.state.user, this.state.password);
      alert('Cadastro realizado com sucesso!');
      // Passando o nome de usuário após o cadastro
      this.props.navigation.navigate('Home', { usuario: this.state.user });
    } catch (erro) {
      alert('Erro ao salvar!');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Cadastrar Usuário:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(texto) => this.setState({ user: texto })}
          placeholder="Digite seu usuário"
          placeholderTextColor="#AFAFAF"
        />
        <Text style={styles.label}>Cadastrar Senha:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(texto) => this.setState({ password: texto })}
          secureTextEntry
          placeholder="Digite sua senha"
          placeholderTextColor="#AFAFAF"
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Cadastrar"
            onPress={() => this.gravar()}
            color="#DAA520"
          />
        </View>
      </View>
    );
  }
}

class HomeScreen extends React.Component {
  render() {
    const { usuario } = this.props.route.params; // Obtendo o nome do usuário

    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Bem-vindo, {usuario}!</Text>

        {/* Botão para acessar o calendário de transações */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Vibration.vibrate(); // Adiciona vibração ao pressionar
            this.props.navigation.navigate('Calendário de Transações', {
              usuario: usuario,
            });
          }}
        >
          <Text style={styles.buttonText}>Acessar Calendário de Transações</Text>
        </TouchableOpacity>

        {/* Novo botão para acessar o calendário de investimentos */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Vibration.vibrate(); // Adiciona vibração ao pressionar
            this.props.navigation.navigate('Calendário de Investimentos', {
              usuario: usuario,
            });
          }}
        >
          <Text style={styles.buttonText}>Acessar Calendário de Investimentos</Text>
        </TouchableOpacity>

        {/* Novo botão para acessar Dicas Financeiras */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Vibration.vibrate(); // Adiciona vibração ao pressionar
            this.props.navigation.navigate('Dicas Financeiras');
          }}
        >
          <Text style={styles.buttonText}>Dicas Financeiras</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
class FinancialTipsScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dicas Financeiras</Text>

        {/* Primeira imagem */}
        <Image
          source={require('./assets/913d64b9fccbb80953a544db607ed561.jpg')}
          style={styles.image}
        />

        <Text style={styles.infoText}>
          1. Faça um planejamento financeiro mensal.
        </Text>

        {/* Segunda imagem */}
        <Image
          source={require('./assets/marcia-41.jpg')}
          style={styles.image}
        />

        <Text style={styles.infoText}>2. Evite gastar mais do que ganha.</Text>

        {/* Mais dicas... */}

        <TouchableOpacity
          style={styles.button}
          onPress={() => this.props.navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
class CalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      modalVisible: false,
      day: '',
      weekDay: '',
      month: '',
      year: '',
      transactionType: '',
      amount: '',
    };
  }

  componentDidMount() {
    this.loadTransactions();
  }

  async loadTransactions() {
    const { usuario } = this.props.route.params;
    try {
      const savedTransactions = await AsyncStorage.getItem(
        `${usuario}_transactions`
      );
      if (savedTransactions) {
        this.setState({ transactions: JSON.parse(savedTransactions) });
      }
    } catch (error) {
      console.log('Erro ao carregar transações:', error);
    }
  }

  async saveTransaction() {
    const { day, weekDay, month, year, transactionType, amount } = this.state;
    if (!day || !weekDay || !month || !year || !transactionType || !amount) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const { usuario } = this.props.route.params;
    const newTransaction = {
      day,
      weekDay,
      month,
      year,
      transactionType,
      amount,
    };
    const updatedTransactions = [...this.state.transactions, newTransaction];

    try {
      await AsyncStorage.setItem(
        `${usuario}_transactions`,
        JSON.stringify(updatedTransactions)
      );
      this.setState({
        transactions: updatedTransactions,
        modalVisible: false,
        day: '',
        weekDay: '',
        month: '',
        year: '',
        transactionType: '',
        amount: '',
      });
      alert('Transação salva!');
    } catch (error) {
      console.log('Erro ao salvar transação:', error);
    }
  }

  async deleteTransaction(index) {
    const { usuario } = this.props.route.params;
    const updatedTransactions = this.state.transactions.filter(
      (_, i) => i !== index
    );
    try {
      await AsyncStorage.setItem(
        `${usuario}_transactions`,
        JSON.stringify(updatedTransactions)
      );
      this.setState({ transactions: updatedTransactions });
      alert('Transação excluída!');
    } catch (error) {
      console.log('Erro ao excluir transação:', error);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Calendário de Transações</Text>

        <FlatList
          data={this.state.transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionText}>
                {item.day}/{item.month}/{item.year} ({item.weekDay}):{' '}
                {item.transactionType} - R${item.amount}
              </Text>
              <Button
                title="Apagar"
                color="#FF6347"
                onPress={() => this.deleteTransaction(index)}
              />
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => this.setState({ modalVisible: true })}>
          <Text style={styles.addButtonText}>+ Adicionar Transação</Text>
        </TouchableOpacity>

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          transparent={true}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalContainer}>
              <KeyboardAvoidingView
                behavior="padding"
                style={styles.modalInnerContainer}>
                <Text style={styles.modalTitle}>Adicionar Transação</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Dia"
                   placeholderTextColor="#DAA520" // Alterado para uma cor visível
                  onChangeText={(text) => this.setState({ day: text })}
                  value={this.state.day}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dia da Semana"
                   placeholderTextColor="#DAA520" // Alterado para uma cor visível
                  onChangeText={(text) => this.setState({ weekDay: text })}
                  value={this.state.weekDay}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mês"
                   placeholderTextColor="#DAA520" // Alterado para uma cor visível
                  onChangeText={(text) => this.setState({ month: text })}
                  value={this.state.month}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ano"
                   placeholderTextColor="#DAA520" // Alterado para uma cor visível
                  onChangeText={(text) => this.setState({ year: text })}
                  value={this.state.year}
                  keyboardType="numeric"
                />

                <Picker
                  selectedValue={this.state.transactionType}
                  style={styles.picker}
                  onValueChange={(itemValue) =>
                    this.setState({ transactionType: itemValue })
                  }>
                  <Picker.Item label="Recebida" value="Recebida" />
                  <Picker.Item label="Enviada" value="Enviada" />
                </Picker>

                <TextInput
                  style={styles.input}
                  placeholder="Valor"
                   placeholderTextColor="#DAA520" // Alterado para uma cor visível
                  onChangeText={(text) => this.setState({ amount: text })}
                  value={this.state.amount}
                  keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                  <Button
                    title="Cancelar"
                    onPress={() => this.setState({ modalVisible: false })}
                    color="#DAA520"
                  />
                  <Button
                    title="Salvar"
                    onPress={() => this.saveTransaction()}
                    color="#DAA520"
                  />
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }
}
class InvestmentCalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      investments: [],
      modalVisible: false,
      day: '',
      month: '',
      year: '',
      investmentType: '',
      amount: '',
      description: '',
    };
  }

  componentDidMount() {
    this.loadInvestments();
  }

  async loadInvestments() {
    const { usuario } = this.props.route.params;
    try {
      const savedInvestments = await AsyncStorage.getItem(
        `${usuario}_investments`
      );
      if (savedInvestments) {
        this.setState({ investments: JSON.parse(savedInvestments) });
      }
    } catch (error) {
      console.log('Erro ao carregar investimentos:', error);
    }
  }

  async saveInvestment() {
    const { day, month, year, investmentType, amount, description } = this.state;
    if (!day || !month || !year || !investmentType || !amount || !description) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const { usuario } = this.props.route.params;
    const newInvestment = { day, month, year, investmentType, amount, description };
    const updatedInvestments = [...this.state.investments, newInvestment];

    try {
      await AsyncStorage.setItem(
        `${usuario}_investments`,
        JSON.stringify(updatedInvestments)
      );
      this.setState({
        investments: updatedInvestments,
        modalVisible: false,
        day: '',
        month: '',
        year: '',
        investmentType: '',
        amount: '',
        description: '',
      });
      Keyboard.dismiss(); // Oculta o teclado
      alert('Investimento salvo!');
    } catch (error) {
      console.log('Erro ao salvar investimento:', error);
    }
  }

  async deleteInvestment(index) {
    const { usuario } = this.props.route.params;
    const updatedInvestments = this.state.investments.filter(
      (_, i) => i !== index
    );
    try {
      await AsyncStorage.setItem(
        `${usuario}_investments`,
        JSON.stringify(updatedInvestments)
      );
      this.setState({ investments: updatedInvestments });
      alert('Investimento excluído!');
    } catch (error) {
      console.log('Erro ao excluir investimento:', error);
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.title}>Calendário de Investimentos</Text>

            <FlatList
              data={this.state.investments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.transactionItem}>
                  <Text style={styles.transactionText}>
                    {item.day}/{item.month}/{item.year}: {item.investmentType} - R$
                    {item.amount} ({item.description})
                  </Text>
                  <Button
                    title="Apagar"
                    color="#FF6347"
                    onPress={() => this.deleteInvestment(index)}
                  />
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => this.setState({ modalVisible: true })}>
              <Text style={styles.addButtonText}>+ Adicionar Investimento</Text>
            </TouchableOpacity>

            <Modal
              visible={this.state.modalVisible}
              animationType="slide"
              transparent={true}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Adicionar Investimento</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Dia"
                     placeholderTextColor="#DAA520" // Alterado para uma cor visível
                    onChangeText={(text) => this.setState({ day: text })}
                    value={this.state.day}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mês"
                     placeholderTextColor="#DAA520" // Alterado para uma cor visível
                    onChangeText={(text) => this.setState({ month: text })}
                    value={this.state.month}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ano"
                     placeholderTextColor="#DAA520" // Alterado para uma cor visível
                    onChangeText={(text) => this.setState({ year: text })}
                    value={this.state.year}
                    keyboardType="numeric"
                  />

                  <Picker
                    selectedValue={this.state.investmentType}
                    style={styles.picker}
                    onValueChange={(itemValue) =>
                      this.setState({ investmentType: itemValue })
                    }>
                    <Picker.Item label="Ações" value="Ações" />
                    <Picker.Item label="Fundo Imobiliário" value="Fundo Imobiliário" />
                    <Picker.Item label="Cripto" value="Cripto" />
                    <Picker.Item label="Renda Fixa" value="Renda Fixa" />
                  </Picker>

                  <TextInput
                    style={styles.input}
                    placeholder="Valor"
                     placeholderTextColor="#DAA520" // Alterado para uma cor visível
                    onChangeText={(text) => this.setState({ amount: text })}
                    value={this.state.amount}
                    keyboardType="numeric"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Descrição (Onde Investiu)"
                     placeholderTextColor="#DAA520" // Alterado para uma cor visível
                    onChangeText={(text) => this.setState({ description: text })}
                    value={this.state.description}
                  />

                  <View style={styles.modalButtons}>
                    <Button
                      title="Cancelar"
                      onPress={() => {
                        this.setState({ modalVisible: false });
                        Keyboard.dismiss(); // Oculta o teclado
                      }}
                      color="#DAA520"
                    />
                    <Button
                      title="Salvar"
                      onPress={() => this.saveInvestment()}
                      color="#DAA520"
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Principal} />
        <Stack.Screen name="Criar Usuário" component={Cadastro} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Página Inicial' }}
        />
        <Stack.Screen
          name="Calendário de Transações"
          component={CalendarScreen}
          initialParams={{ usuario: 'default_user' }} // Passando nome de usuário para a tela
        />
        <Stack.Screen
          name="Calendário de Investimentos"
          component={InvestmentCalendarScreen}
          initialParams={{ usuario: 'default_user' }} // Passando nome de usuário para a tela de investimentos
        />
        <Stack.Screen
          name="Dicas Financeiras"
          component={FinancialTipsScreen} // A nova tela de dicas financeiras
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeText: {
    color: '#DAA520',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DAA520',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#DAA520',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    color: '#DAA520',
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFF',
    color: '#000',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
  linkText: {
    color: '#DAA520',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  transactionItem: {
    padding: 10,
    borderBottomColor: '#444',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionText: {
    color: '#FFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#DAA520',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#333',
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#DAA520',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Novos estilos adicionados
  picker: {
    backgroundColor: '#333',
    color: '#DAA520',
    marginVertical: 10,
    width: '100%',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  image: {
     width: '100%', // Define a imagem para preencher a largura do contêiner
    height: 200, // Altura da imagem (pode ser ajustada conforme necessário)
    resizeMode: 'contain', // Ajusta a imagem para conter no espaço sem cortar
    marginVertical: 10, // Espaçamento vertical para separar as imagens das outras views
  },
});
