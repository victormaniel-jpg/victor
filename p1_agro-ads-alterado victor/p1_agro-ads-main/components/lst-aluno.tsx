import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useCallback, useState } from 'react';

import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { db } from "@/firebase";
import { deleteDoc, doc, collection, getDocs } from 'firebase/firestore';

import {View, FlatList, StyleSheet, Text, StatusBar, TouchableOpacity, Alert, Platform} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

interface Aluno{
    id: string;
    nome: string;
    idade: string;
    email: string;
    matricula: string;
}

export default function LstAlunos(){

  const [alunos, setAlunos ] = useState<Aluno[]>([]);

  const carregarAlunos = useCallback(async () => {
      try{
          const dados = await getDocs(collection(db, "alunos"));
          const lista: Aluno[] = dados.docs.map((d)=>({
              id: d.id,
              nome: d.data().nome ?? '',
              idade: String(d.data().idade ?? ''),
              email: d.data().email ?? '',
              matricula: d.data().matricula ?? '',
          }));
          lista.sort((a, b) => a.nome.localeCompare(b.nome));
          setAlunos(lista);
      }catch (error: any){
          console.log("Erro ao consultar alunos:", error.code, error.message);
          Toast.show({
              type: "error",
              text1: "Erro",
              text2: "ERRO AO CONSULTAR DADOS: " + (error.code ?? error.message)
          })
      }
  },[]);

  async function excluirAluno(id: string){
    try{
      await deleteDoc(doc(db, "alunos", id));
      Toast.show({
        type: "success",
        text1: "Deletado!",
        text2: "Registro deletado com Sucesso!"
      });
      carregarAlunos();
    }catch(error: any){
      Toast.show({
        type: "error",
        text1: "Erro!",
        text2: "Erro ao deletar o Registro!"
      })
    }
  }

  function confirmarExclusao(aluno: Aluno){
    // Alert com botões não funciona na web, então exclui direto nela
    if (Platform.OS === 'web') {
      excluirAluno(aluno.id);
      return;
    }
    Alert.alert(
      "Excluir aluno",
      `Deseja realmente excluir ${aluno.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluirAluno(aluno.id) },
      ]
    );
  }

  function editarAluno(id: string){
    router.push({ pathname: "/(tabs)/aluno",params:{id}})
  }

  useFocusRefresh(carregarAlunos);

  return (
   <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={alunos}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum aluno cadastrado.</Text>
        }
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.info}>Idade: {item.idade}</Text>
            <Text style={styles.info}>E-mail: {item.email}</Text>
            <Text style={styles.info}>Matrícula: {item.matricula}</Text>

            <View style={styles.acoes}>
              <TouchableOpacity style={styles.botao} onPress={()=>editarAluno(item.id)}>
                <Text>Alterar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botao} onPress={()=>confirmarExclusao(item)}>
                <Text>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Toast />
    </SafeAreaView>
  </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#f9c2ff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 15,
  },
  acoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  botao: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 6,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
