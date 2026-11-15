import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet
} from 'react-native';

import { useState, useCallback } from 'react';
import Toast from "react-native-toast-message";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "@/firebase";
import { doc, addDoc, updateDoc, collection, getDoc } from 'firebase/firestore';
import { useFocusRefresh } from '@/hooks/use-focus-refresh';

export default function CadAluno() {
    //Recebendo os dados da tela de consultar
    const { id } = useLocalSearchParams<{ id?: string }>();
    ////////////////////////////////////
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState('');
    const [email, setEmail] = useState('');
    const [matricula, setMatricula] = useState('');

    function limparCampos() {
        setNome('');
        setIdade('');
        setEmail('');
        setMatricula('');
    }

    const carregarAlunos = useCallback(async () => {
        // Sem id = cadastro novo: formulário em branco
        if (!id) {
            limparCampos();
            return;
        }

        try {
            const dados = await getDoc(doc(db, "alunos", id));

            if (!dados.exists()) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro',
                    text2: 'Aluno não encontrado',
                });
                return;
            }

            const aluno = dados.data();

            setNome(aluno?.nome ?? '');
            setIdade(String(aluno?.idade ?? ''));
            setEmail(aluno?.email ?? '');
            setMatricula(aluno?.matricula ?? '');

        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Erro ao carregar o aluno',
            });
        }

    }, [id]);

    useFocusRefresh(carregarAlunos);

    function validar(): boolean {
        if (!nome.trim() || !matricula.trim()) {
            Toast.show({
                type: "error",
                text1: 'Atenção!',
                text2: 'Informe pelo menos nome e matrícula.'
            });
            return false;
        }
        if (idade && isNaN(Number(idade))) {
            Toast.show({
                type: "error",
                text1: 'Atenção!',
                text2: 'A idade deve ser um número.'
            });
            return false;
        }
        return true;
    }

    async function onPress() {
        if (!validar()) return;

        const aluno = {
            nome: nome.trim(),
            idade: idade.trim(),
            email: email.trim(),
            matricula: matricula.trim(),
        };

        try {
            if (id) {
                // Alterar: atualiza o registro existente
                await updateDoc(doc(db, "alunos", id), aluno);
                Toast.show({
                    type: "success",
                    text1: 'Sucesso!',
                    text2: 'Aluno Alterado!'
                });
                limparCampos();
                router.setParams({ id: '' });
                router.navigate("/(tabs)/lstAlunos");
            } else {
                // Cadastrar: cria um novo registro
                await addDoc(collection(db, "alunos"), aluno);
                Toast.show({
                    type: "success",
                    text1: 'Sucesso!',
                    text2: 'Usuário Cadastrado!'
                });
                limparCampos();
            }
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: 'Erro!',
                text2: id ? 'Aluno Não Alterado!' : 'Usuário Não Cadastrado!'
            });
        }
    }

    function cancelarEdicao() {
        limparCampos();
        router.setParams({ id: '' });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.baseText}>
                {id ? 'Alterar Aluno' : 'Cadastrar Aluno'}
            </Text>
            <TextInput
                style={styles.input}
                onChangeText={setNome}
                value={nome}
                placeholder="Nome do Aluno"
            />
            <TextInput
                style={styles.input}
                onChangeText={setIdade}
                value={idade}
                placeholder="Idade do aluno"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="E-mail do aluno"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                onChangeText={setMatricula}
                value={matricula}
                placeholder="Matricula do aluno"
            />

            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text>{id ? 'Alterar' : 'Cadastrar'}</Text>
            </TouchableOpacity>

            {id ? (
                <TouchableOpacity style={styles.button} onPress={cancelarEdicao}>
                    <Text>Cancelar</Text>
                </TouchableOpacity>
            ) : null}

            <Toast />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    baseText: {
        fontFamily: 'Cochin',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 12,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
        margin: 12
    },
});
