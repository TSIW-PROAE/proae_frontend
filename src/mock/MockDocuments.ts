export class MockDocuments {
    getDocuments() {
        return [
            {
                id: '1',
                name: 'Document 1',
                type: 'pdf',
                date: '2023-01-01',
                status: 'approved',
            },
            {
                id: '2',
                name: 'Document 2',
                type: 'jpg',
                date: '2023-02-01',
                status: 'pending',
            },
        ];
    }
}